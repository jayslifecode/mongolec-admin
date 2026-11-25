import { z } from 'zod'
import { optionalUrl, slug } from '@/lib/validation/rules'

export const participantFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  // The featured photo every rider is shown by (round 4): required.
  photo: z.string().trim().min(1, 'A featured photo is required').pipe(optionalUrl),
  country: z.string().trim().min(1, 'Country is required'),
  bio: z.string().trim().optional(),
  displayOrder: z
    .number({ message: 'Enter a whole number' })
    .int('Enter a whole number')
    .min(0, 'Must be 0 or greater'),
  isActive: z.boolean(),
  slug: z.union([z.literal(''), slug]),
  honoraryTitle: z.string().trim().max(120, 'Keep it under 120 characters').optional(),
  rallyIds: z.array(z.string().min(1)),
})

export type ParticipantFormValues = z.infer<typeof participantFormSchema>

export interface ParticipantFormValidationResult {
  isValid: boolean
  fieldErrors: Record<string, string>
}

/**
 * Validates the participant profile form via zod, returning a single
 * immutable result with per-field error messages.
 */
export function validateParticipantForm(
  values: ParticipantFormValues,
): ParticipantFormValidationResult {
  const result = participantFormSchema.safeParse(values)
  if (result.success) {
    return { isValid: true, fieldErrors: {} }
  }

  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message
    }
  }

  return { isValid: false, fieldErrors }
}
