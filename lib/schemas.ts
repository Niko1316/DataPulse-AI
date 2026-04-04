import { z } from 'zod'

export const uploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(52428800),
  contentType: z.literal('application/pdf'),
})

export const projectConfigSchema = z.object({
  projectId: z.string().uuid(),
  languages: z.array(z.enum(['en', 'fr', 'es'])).min(1).max(3),
  platforms: z.array(z.enum(['linkedin', 'twitter', 'instagram', 'infographic'])).min(1),
  tone: z.enum(['analytical', 'conversational', 'bold', 'corporate']).default('analytical'),
  objective: z.enum(['thought_leadership', 'lead_generation', 'report_promotion', 'brand_awareness']).default('thought_leadership'),
  targetAudience: z.enum(['executives', 'operators', 'marketers', 'investors', 'general_professional']).default('general_professional'),
  cta: z.string().max(200).optional(),
  brandName: z.string().max(100).optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  hashtags: z.array(z.string()).max(10).optional(),
})

export const checkoutSubscriptionSchema = z.object({
  priceId: z.string().min(1),
})

export const checkoutCreditsSchema = z.object({
  priceId: z.string().min(1),
  credits: z.number().positive(),
})

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  preferredLanguage: z.enum(['en', 'fr', 'es']).optional(),
})
