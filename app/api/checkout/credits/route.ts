import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'
import { checkoutCreditsSchema } from '@/lib/schemas'
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

  // Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = checkoutCreditsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { priceId, credits } = parsed.data

  // Look up existing Stripe customer ID if available
  const admin = createAdminClient()
  const { data: customer } = await admin
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.headers.get('origin') ?? ''

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        userId: user.id,
        type: 'credit_purchase',
        credits: String(credits),
      },
      customer: customer?.stripe_customer_id ?? undefined,
      customer_email: customer?.stripe_customer_id ? undefined : user.email,
      success_url: `${baseUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?checkout=canceled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Failed to create credits checkout session:', message)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
