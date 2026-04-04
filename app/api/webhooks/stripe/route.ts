import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      if (session.customer) {
        const userId = session.metadata?.userId
        if (userId) {
          await supabase.from('customers').upsert({
            id: userId,
            stripe_customer_id: session.customer as string,
          })
        }
      }

      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
        const item = subscription.items.data[0]
        await supabase.from('subscriptions').upsert({
          id: subscription.id,
          user_id: session.metadata?.userId,
          status: subscription.status,
          price_id: item.price.id,
          current_period_start: new Date(item.current_period_start * 1000).toISOString(),
          current_period_end: new Date(item.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        })
      }

      if (session.mode === 'payment' && session.metadata?.type === 'credit_purchase') {
        const credits = parseInt(session.metadata.credits || '0')
        if (credits > 0 && session.metadata?.userId) {
          await supabase.rpc('add_credits', {
            p_user_id: session.metadata.userId,
            p_credits: credits,
          })
        }
      }

      if (session.mode === 'payment' && session.metadata?.type === 'authority_pack') {
        await fetch(process.env.N8N_OVERSEER_WEBHOOK!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { object: session } }),
        }).catch(console.error)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const subItem = sub.items.data[0]
      await supabase.from('subscriptions').upsert({
        id: sub.id,
        status: sub.status,
        price_id: subItem.price.id,
        current_period_end: new Date(subItem.current_period_end * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions').update({ status: 'canceled' }).eq('id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subId = invoice.parent?.subscription_details?.subscription
      if (subId) {
        const subscriptionId = typeof subId === 'string' ? subId : subId.id
        await supabase.from('subscriptions')
          .update({ status: 'past_due' })
          .eq('id', subscriptionId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
