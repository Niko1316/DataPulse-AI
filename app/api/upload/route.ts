import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadSchema } from '@/lib/schemas'
import { uploadRateLimit, checkRateLimit } from '@/lib/ratelimit'
import { getPlanFromPriceId, PLANS } from '@/lib/stripe/plans'

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const rl = await checkRateLimit(uploadRateLimit, user.id)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many upload requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(rl.remaining),
          'X-RateLimit-Reset': String(rl.reset),
        },
      }
    )
  }

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = uploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { fileName, fileSize, contentType } = parsed.data

  // Resolve user plan
  const admin = createAdminClient()

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('price_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle()

  const planId = subscription?.price_id
    ? getPlanFromPriceId(subscription.price_id)
    : 'free'

  const planLimits = PLANS[planId].limits
  const maxBytes = planLimits.maxFileSizeMB * 1024 * 1024

  if (fileSize > maxBytes) {
    return NextResponse.json(
      {
        error: `File size exceeds the ${planLimits.maxFileSizeMB} MB limit for your plan.`,
        maxFileSizeMB: planLimits.maxFileSizeMB,
      },
      { status: 413 }
    )
  }

  // Check monthly PDF quota
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

  if (used >= planLimits.pdfsPerMonth) {
    // Check if user has credits
    const { data: creditRow } = await admin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!creditRow || creditRow.balance <= 0) {
      return NextResponse.json(
        {
          error: `You've used all ${planLimits.pdfsPerMonth} PDFs for this month. Purchase credit packs or upgrade your plan.`,
          used,
          limit: planLimits.pdfsPerMonth,
        },
        { status: 403 }
      )
    }
  }

  // Create project record
  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert({
      user_id: user.id,
      file_name: fileName,
      file_size: fileSize,
      status: 'pending',
    })
    .select('id')
    .single()

  if (projectError || !project) {
    console.error('Failed to create project:', projectError)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }

  const projectId: string = project.id
  const storagePath = `${user.id}/${projectId}/${fileName}`

  // Create signed upload URL
  const { data: signedData, error: signedError } = await admin.storage
    .from('pdfs')
    .createSignedUploadUrl(storagePath)

  if (signedError || !signedData) {
    console.error('Failed to create signed upload URL:', signedError)
    // Clean up the project record on failure
    await admin.from('projects').delete().eq('id', projectId)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }

  return NextResponse.json({
    projectId,
    uploadUrl: signedData.signedUrl,
    storagePath,
  })
}
