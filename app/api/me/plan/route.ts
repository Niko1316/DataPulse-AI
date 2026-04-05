import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanFromPriceId, PLANS } from '@/lib/stripe/plans'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('price_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle()

  const planId = subscription?.price_id ? getPlanFromPriceId(subscription.price_id) : 'free'
  const plan = PLANS[planId]

  // Get monthly usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount } = await admin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_type', 'pdf_processed')
    .gte('created_at', startOfMonth.toISOString())

  const { data: creditRow } = await admin
    .from('credits')
    .select('balance')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    planId,
    limits: plan.limits,
    features: plan.features,
    usage: {
      pdfsUsed: usageCount || 0,
      pdfsLimit: plan.limits.pdfsPerMonth,
      credits: creditRow?.balance || 0,
    },
  })
}
