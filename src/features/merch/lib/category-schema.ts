import { z } from 'zod'
import { slug } from '@/lib/validation/rules'

export const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const hexColor = z.string().trim().regex(HEX_COLOR_PATTERN, 'Use a hex colour like #3b82f6')

/** Fields every category form (merch and news) shares. Names are required in both languages. */
export const categoryBaseSchema = z.object({
  name_en: z.string().trim().min(1, 'Enter the English name').max(100, 'Keep the name under 100 characters'),
  name_mn: z.string().trim().min(1, 'Enter the Mongolian name').max(100, 'Keep the name under 100 characters'),
  slug,
  description_en: z.string().trim().max(500, 'Keep the description under 500 characters').optional(),
  description_mn: z.string().trim().max(500, 'Keep the description under 500 characters').optional(),
})

export const merchCategorySchema = categoryBaseSchema
export type MerchCategoryFormData = z.infer<typeof merchCategorySchema>

/** Which language tab holds the first error, so the form can switch to it. */
export function firstErrorLanguage(errorKeys: string[]): 'en' | 'mn' | null {
  const key = errorKeys.find((k) => k.endsWith('_en') || k.endsWith('_mn'))
  if (!key) return null
  return key.endsWith('_mn') ? 'mn' : 'en'
}
