import 'server-only'
import Stripe from 'stripe'

let _stripe: Stripe | undefined

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    _stripe = new Stripe(key, { typescript: true })
  }
  return _stripe
}

// Keep backward-compatible named export (lazy getter)
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
