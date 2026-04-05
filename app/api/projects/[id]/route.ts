import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { apiRateLimit, checkRateLimit } from '@/lib/ratelimit'
import { projectConfigSchema } from '@/lib/schemas'
import { getPlanFromPriceId, PLANS } from '@/lib/stripe/plans'
import { inngest } from '@/lib/inngest/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const rl = await checkRateLimit(apiRateLimit, user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { id } = await params

  // Fetch project with related data, enforcing ownership via user_id filter
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      *,
      document_insights (*),
      generated_assets (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !project) {
    // Differentiate between not found and DB error
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    console.error('Failed to fetch project:', error)
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }

  return NextResponse.json({ project })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(apiRateLimit, user.id)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }

  const { id } = await params

  // Parse config
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = projectConfigSchema.safeParse({ ...body as Record<string, unknown>, projectId: id })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid config', details: parsed.error.flatten() }, { status: 400 })
  }

  const config = parsed.data

  // Verify project ownership and pending status
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, status, file_name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  if (project.status !== 'pending') {
    return NextResponse.json({ error: 'Project already processed or processing' }, { status: 409 })
  }

  // Resolve user plan and enforce limits
  const admin = createAdminClient()

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('price_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle()

  const planId = subscription?.price_id ? getPlanFromPriceId(subscription.price_id) : 'free'
  const plan = PLANS[planId]

  // Check monthly quota (plan PDFs + credits)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount } = await admin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_type', 'pdf_processed')
    .gte('created_at', startOfMonth.toISOString())

  const used = usageCount || 0

  // Check credits if over plan limit
  let useCredit = false
  if (used >= plan.limits.pdfsPerMonth) {
    const { data: creditRow } = await admin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!creditRow || creditRow.balance <= 0) {
      return NextResponse.json(
        { error: `Monthly limit of ${plan.limits.pdfsPerMonth} PDFs reached. Purchase credits or upgrade your plan.` },
        { status: 403 }
      )
    }
    useCredit = true
  }

  // Enforce platform limits
  if (config.platforms.length > plan.limits.platforms) {
    const allowed = plan.limits.platforms
    return NextResponse.json(
      { error: `Your ${planId} plan allows ${allowed} platform${allowed > 1 ? 's' : ''}. Upgrade to access more.` },
      { status: 403 }
    )
  }

  // Enforce language limits
  if (config.languages.length > plan.limits.languages) {
    const allowed = plan.limits.languages
    return NextResponse.json(
      { error: `Your ${planId} plan allows ${allowed} language${allowed > 1 ? 's' : ''}. Upgrade for trilingual content.` },
      { status: 403 }
    )
  }

  // Free plan: LinkedIn only
  if (planId === 'free') {
    const invalidPlatforms = config.platforms.filter(p => p !== 'linkedin')
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: 'Free plan supports LinkedIn only. Upgrade to access other platforms.' },
        { status: 403 }
      )
    }
    if (config.languages.some(l => l !== 'en')) {
      return NextResponse.json(
        { error: 'Free plan supports English only. Upgrade for multilingual content.' },
        { status: 403 }
      )
    }
  }

  // Starter plan: LinkedIn + Twitter only, English only
  if (planId === 'starter') {
    const invalidPlatforms = config.platforms.filter(p => !['linkedin', 'twitter'].includes(p))
    if (invalidPlatforms.length > 0) {
      return NextResponse.json(
        { error: 'Starter plan supports LinkedIn and Twitter only. Upgrade to Professional for all platforms.' },
        { status: 403 }
      )
    }
    if (config.languages.some(l => l !== 'en')) {
      return NextResponse.json(
        { error: 'Starter plan supports English only. Upgrade to Professional for multilingual content.' },
        { status: 403 }
      )
    }
  }

  // Deduct credit if needed
  if (useCredit) {
    await admin.rpc('deduct_credit', { p_user_id: user.id })
  }

  // Get file path for storage
  const storagePath = `${user.id}/${id}/${project.file_name}`

  // Send event to Inngest for async processing
  await inngest.send({
    name: 'pdf/uploaded',
    data: {
      projectId: id,
      userId: user.id,
      filePath: storagePath,
      languages: config.languages,
      platforms: config.platforms,
      tone: config.tone,
      objective: config.objective,
      targetAudience: config.targetAudience,
      cta: config.cta || '',
      brandName: config.brandName || '',
    },
  })

  return NextResponse.json({ success: true, projectId: id })
}
