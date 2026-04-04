import { inngest } from '../client'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export const processPDF = inngest.createFunction(
  { id: 'process-pdf-to-social', retries: 3, concurrency: { limit: 5 }, triggers: [{ event: 'pdf/uploaded' }] },
  async ({ event, step }) => {
    const { projectId, userId, filePath, languages, platforms, tone, objective, targetAudience, cta } = event.data

    const supabase = createAdminClient()

    await step.run('update-status-processing', async () => {
      await supabase.from('projects')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', projectId)
    })

    const pdfUrl = await step.run('get-pdf-url', async () => {
      const { data } = await supabase.storage
        .from('pdfs')
        .createSignedUrl(filePath, 3600)
      return data?.signedUrl
    })

    if (!pdfUrl) throw new Error('Cannot get PDF URL')

    const claudeResult = await step.run('claude-process-pdf', async () => {
      const langList = (languages as string[]).join(', ')
      const platformList = (platforms as string[]).join(', ')

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: `You are an expert B2B content strategist and document intelligence analyst. Your task is to transform a PDF document into a complete, publish-ready social media content pack.

LANGUAGE REQUIREMENTS: Generate ALL content in these languages: ${langList}. For each content piece, provide versions in each requested language under keys "en", "fr", "es" as applicable.

TONE: ${tone}
OBJECTIVE: ${objective}
TARGET AUDIENCE: ${targetAudience}
CTA: ${cta || 'Learn more'}
PLATFORMS: ${platformList}

OUTPUT FORMAT: Return ONLY valid JSON with this exact structure:
{
  "document_summary": "string",
  "key_themes": ["string"],
  "extracted_statistics": [{"stat": "string", "context": "string", "page_ref": "string"}],
  "counter_intuitive_insights": [{"insight": "string", "why_surprising": "string", "source": "string"}],
  "suggested_angles": ["string"],
  "linkedin_posts": [{"en": "string", "fr": "string", "es": "string", "hook": "string", "visual_brief": "string"}],
  "twitter_threads": [{"en": "string", "fr": "string", "es": "string", "visual_brief": "string"}],
  "instagram_carousel": [{"slide_number": 1, "title": {"en": "string", "fr": "string", "es": "string"}, "body": {"en": "string", "fr": "string", "es": "string"}}],
  "infographic": {"title": {"en": "string", "fr": "string", "es": "string"}, "data_points": [{"label": {"en": "string", "fr": "string", "es": "string"}, "value": "string"}], "footer": "string"}
}`,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'url', url: pdfUrl },
            },
            {
              type: 'text',
              text: `Analyze this document and generate the complete social media content pack. Generate 5 LinkedIn posts, 5 Twitter posts, 6-8 Instagram carousel slides, and 1 infographic structure. For each LinkedIn post, include a strong opening hook. Ensure all statistics are sourced precisely. Return only valid JSON, no markdown.`,
            },
          ],
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const clean = text.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    })

    await step.run('save-insights', async () => {
      await supabase.from('document_insights').insert({
        project_id: projectId,
        user_id: userId,
        summary: claudeResult.document_summary,
        key_themes: claudeResult.key_themes,
        extracted_statistics: claudeResult.extracted_statistics,
        counter_intuitive_insights: claudeResult.counter_intuitive_insights,
        suggested_angles: claudeResult.suggested_angles,
      })
    })

    await step.run('save-assets', async () => {
      const assets: Array<Record<string, unknown>> = []

      for (const post of (claudeResult.linkedin_posts || [])) {
        for (const lang of (languages as string[])) {
          assets.push({
            project_id: projectId,
            user_id: userId,
            platform: 'linkedin',
            language: lang,
            content_type: 'post',
            content_text: post[lang] || post.en || '',
            content_json: post,
            visual_brief: post.visual_brief || '',
          })
        }
      }

      for (const post of (claudeResult.twitter_threads || [])) {
        for (const lang of (languages as string[])) {
          assets.push({
            project_id: projectId,
            user_id: userId,
            platform: 'twitter',
            language: lang,
            content_type: 'thread',
            content_text: post[lang] || post.en || '',
            content_json: post,
            visual_brief: post.visual_brief || '',
          })
        }
      }

      assets.push({
        project_id: projectId,
        user_id: userId,
        platform: 'instagram',
        language: (languages as string[])[0] || 'en',
        content_type: 'carousel',
        content_text: 'Instagram Carousel',
        content_json: { slides: claudeResult.instagram_carousel },
      })

      assets.push({
        project_id: projectId,
        user_id: userId,
        platform: 'infographic',
        language: (languages as string[])[0] || 'en',
        content_type: 'infographic',
        content_text: 'Infographic',
        content_json: claudeResult.infographic,
      })

      await supabase.from('generated_assets').insert(assets)
    })

    await step.run('complete-project', async () => {
      await supabase.from('projects')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', projectId)

      await supabase.from('usage_logs').insert({
        user_id: userId,
        action_type: 'pdf_processed',
        project_id: projectId,
      })
    })

    return { success: true, projectId, assetsCount: claudeResult.linkedin_posts?.length ?? 0 }
  }
)
