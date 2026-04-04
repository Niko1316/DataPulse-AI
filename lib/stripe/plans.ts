export const PLANS = {
  free: {
    name: { en: 'Free', fr: 'Gratuit', es: 'Gratis' },
    price: { monthly: 0, yearly: 0 },
    priceIds: { monthly: '', yearly: '' },
    limits: {
      pdfsPerMonth: 2,
      maxFileSizeMB: 10,
      maxPages: 25,
      platforms: 1,
      languages: 1,
      teamMembers: 1,
      brandVoices: 0,
    },
    features: ['pdf_upload', 'linkedin_only', 'english_only'],
    badge: null,
  },
  starter: {
    name: { en: 'Starter', fr: 'Débutant', es: 'Inicial' },
    price: { monthly: 2900, yearly: 2300 },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY || '',
    },
    limits: {
      pdfsPerMonth: 10,
      maxFileSizeMB: 25,
      maxPages: 25,
      platforms: 2,
      languages: 1,
      teamMembers: 1,
      brandVoices: 0,
    },
    features: ['pdf_upload', 'linkedin', 'twitter', 'basic_analytics'],
    badge: null,
  },
  professional: {
    name: { en: 'Professional', fr: 'Professionnel', es: 'Profesional' },
    price: { monthly: 7900, yearly: 6300 },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || '',
    },
    limits: {
      pdfsPerMonth: 40,
      maxFileSizeMB: 50,
      maxPages: 75,
      platforms: 3,
      languages: 3,
      teamMembers: 3,
      brandVoices: 1,
    },
    features: ['all_platforms', 'trilingual', 'brand_voice', 'advanced_analytics', 'calendar_export'],
    badge: 'MOST POPULAR',
  },
  business: {
    name: { en: 'Business', fr: 'Business', es: 'Empresa' },
    price: { monthly: 19900, yearly: 15900 },
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY || '',
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_YEARLY || '',
    },
    limits: {
      pdfsPerMonth: 120,
      maxFileSizeMB: 50,
      maxPages: 150,
      platforms: 3,
      languages: 3,
      teamMembers: 10,
      brandVoices: 5,
    },
    features: ['all_platforms', 'trilingual', 'api_access', 'bulk_upload', 'white_label', 'approval_workflow', '5_brand_voices'],
    badge: null,
  },
} as const

export type PlanId = keyof typeof PLANS

export const CREDIT_PACKS = [
  { credits: 5, price: 1900, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_5 || '', label: 'Starter Pack' },
  { credits: 15, price: 4900, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_15 || '', label: 'Growth Pack' },
  { credits: 40, price: 11900, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_40 || '', label: 'Power Pack' },
  { credits: 100, price: 24900, priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREDITS_100 || '', label: 'Mega Pack' },
]

export function getPlanFromPriceId(priceId: string): PlanId {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if ('priceIds' in plan && (plan.priceIds.monthly === priceId || plan.priceIds.yearly === priceId)) {
      return planId as PlanId
    }
  }
  return 'free'
}
