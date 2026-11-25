import { z } from 'zod'
import { email, phone } from '@/lib/validation/rules'
import { collectFieldErrors } from '@/features/people/lib/field-errors'

export const parkPartnerFormSchema = z.object({
  parkName: z.object({
    en: z.string().trim().min(1, 'Enter the park name in English'),
    mn: z.string(),
  }),
  country: z.string().trim().min(1, 'Enter the country'),
  rangersCount: z
    .number({ message: 'Enter a whole number' })
    .int('Enter a whole number')
    .min(0, 'Must be 0 or greater'),
  contactEmail: z.union([z.literal(''), email]),
  contactPhone: z.union([z.literal(''), phone]),
})

export type ParkPartnerFormValues = z.infer<typeof parkPartnerFormSchema>

/** Returns { path: message } (empty when valid). Paths look like "parkName.en". */
export function validateParkPartnerForm(values: ParkPartnerFormValues): Record<string, string> {
  return collectFieldErrors(parkPartnerFormSchema.safeParse(values))
}
