import { z } from 'zod'
import { isValidSlug } from './slugify'
import { validateBlocks } from './blocks'
import type { StoryBlock } from '../types'

export const storyFormSchema = z.object({
  title: z.object({
    en: z.string().trim().min(1, 'Title is required'),
    mn: z.string().trim().optional().default(''),
  }),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .refine(isValidSlug, 'Slug must be lowercase, kebab-case (e.g. my-story-title)'),
  type: z.enum([
    'IMPACT',
    'TESTIMONIAL',
    'RANGER_PROFILE',
    'RIDER_PROFILE',
    'FIELD_MOMENT',
    'BEFORE_AFTER',
    'UPDATE',
    'NEWS',
  ]),
  rallyId: z.string().trim().optional().nullable(),
  excerpt: z
    .object({ en: z.string().trim().optional().default(''), mn: z.string().trim().optional().default('') })
    .optional(),
  featuredImage: z.string().trim().optional(),
  impactSummary: z.object({
    riders: z.number().min(0, 'Must be 0 or greater').optional(),
    kilometers: z.number().min(0, 'Must be 0 or greater').optional(),
    bikes: z.number().min(0, 'Must be 0 or greater').optional(),
  }),
  author: z
    .object({ en: z.string().trim().optional().default(''), mn: z.string().trim().optional().default('') })
    .optional(),
  role: z.string().trim().optional(),
})

export type StoryFormValues = z.infer<typeof storyFormSchema>

export interface StoryFormValidationResult {
  isValid: boolean
  fieldErrors: Record<string, string>
  blockErrors: Record<number, string[]>
}

/**
 * Validates the story form fields (via zod) together with the block editor's
 * content, returning a single combined, immutable result.
 */
export function validateStoryForm(values: StoryFormValues, blocks: StoryBlock[]): StoryFormValidationResult {
  const result = storyFormSchema.safeParse(values)
  const fieldErrors: Record<string, string> = {}

  if (!result.success) {
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (!fieldErrors[path]) fieldErrors[path] = issue.message
    }
  }

  const blockErrors = validateBlocks(blocks)

  return {
    isValid: result.success && Object.keys(blockErrors).length === 0,
    fieldErrors,
    blockErrors,
  }
}
