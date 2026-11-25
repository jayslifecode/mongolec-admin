import { z } from 'zod'
import { optionalUrl } from '@/lib/validation/rules'
import { collectFieldErrors } from '@/features/people/lib/field-errors'

export const rangerFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the ranger’s name'),
  parkName: z.string().trim().min(1, 'Enter the park name'),
  country: z.string().trim().min(1, 'Enter the country'),
  photo: optionalUrl,
  bio: z.string().trim(),
  displayOrder: z
    .number({ message: 'Enter a whole number' })
    .int('Enter a whole number')
    .min(0, 'Must be 0 or greater'),
  isActive: z.boolean(),
  rallyId: z.string(),
})

export type RangerFormValues = z.infer<typeof rangerFormSchema>

/**
 * Returns { field: message } (empty when valid). When `knownRallyIds` is given, a non-empty
 * rallyId must be one of them.
 */
export function validateRangerForm(
  values: RangerFormValues,
  knownRallyIds?: readonly string[],
): Record<string, string> {
  const errors = collectFieldErrors(rangerFormSchema.safeParse(values))
  if (values.rallyId && knownRallyIds && !knownRallyIds.includes(values.rallyId) && !errors.rallyId) {
    return { ...errors, rallyId: 'Choose one of the existing rallies' }
  }
  return errors
}
