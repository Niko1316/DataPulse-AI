import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'
import { apiRateLimit, checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: NextRequest) {
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

  // Look up Stripe customer ID
  const admin = createAdminClient()
  const { data: customer, error: customerError } = await admin
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (customerError) {
    console.error('Failed to look up customer:', customerError)
    return NextResponse.json({ error: 'Failed to retrieve billing information' }, { status: 500 })
  }

  if (!customer?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No billing account found. Please subscribe to a plan first.' },
      { status: 404 }
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get('origin') ?? ''

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/settings`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to create billing portal session:', message)
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 })
  }
}
