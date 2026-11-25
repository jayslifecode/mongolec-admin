import { z } from 'zod'
import { optionalUrl, slug } from '@/lib/validation/rules'

const META_TITLE_MAX = 60
const META_DESCRIPTION_MAX = 160

/** The fields that are validated. The form holds more optional free-text fields that need no checks. */
export interface ArticleFormInput {
  title_en: string
  title_mn: string
  slug: string
  featuredImage: string
  socialImage: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  scheduledAt: string
  metaTitle_en: string
  metaTitle_mn: string
  metaDescription_en: string
  metaDescription_mn: string
}

const articleSchema = z
  .object({
    title_en: z.string().trim().min(1, 'Enter the English title'),
    title_mn: z.string().trim().min(1, 'Enter the Mongolian title'),
    slug,
    featuredImage: optionalUrl,
    socialImage: optionalUrl,
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']),
    scheduledAt: z.string(),
    metaTitle_en: z.string().max(META_TITLE_MAX, `Keep the meta title under ${META_TITLE_MAX} characters`),
    metaTitle_mn: z.string().max(META_TITLE_MAX, `Keep the meta title under ${META_TITLE_MAX} characters`),
    metaDescription_en: z.string().max(META_DESCRIPTION_MAX, `Keep the meta description under ${META_DESCRIPTION_MAX} characters`),
    metaDescription_mn: z.string().max(META_DESCRIPTION_MAX, `Keep the meta description under ${META_DESCRIPTION_MAX} characters`),
  })
  .superRefine((value, ctx) => {
    if (value.status === 'SCHEDULED' && !value.scheduledAt) {
      ctx.addIssue({ code: 'custom', path: ['scheduledAt'], message: 'Pick the date and time to publish' })
    }
  })

export interface ArticleValidationResult {
  fieldErrors: Record<string, string>
  /** The language tab holding the first language-specific error, so the form can switch to it. */
  firstErrorLanguage: 'en' | 'mn' | null
}

export function validateArticleForm(values: ArticleFormInput): ArticleValidationResult {
  const result = articleSchema.safeParse(values)
  if (result.success) return { fieldErrors: {}, firstErrorLanguage: null }

  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message
  }
  const firstKey = Object.keys(fieldErrors)[0]
  const firstErrorLanguage = firstKey?.endsWith('_mn') ? 'mn' : firstKey?.endsWith('_en') ? 'en' : null
  return { fieldErrors, firstErrorLanguage }
}
