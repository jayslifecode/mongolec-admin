import { z } from 'zod'
import { email, optionalUrl } from '@/lib/validation/rules'
import { collectFieldErrors } from '@/features/people/lib/field-errors'

export const teamMemberFormSchema = z.object({
  name: z.string().trim().min(1, 'Enter the member’s name'),
  role: z.string().trim().min(1, 'Enter the member’s role or title'),
  bio: z.string().trim(),
  photo: optionalUrl,
  email: z.union([z.literal(''), email]),
  linkedinUrl: optionalUrl,
  twitterUrl: optionalUrl,
  displayOrder: z
    .number({ message: 'Enter a whole number' })
    .int('Enter a whole number')
    .min(0, 'Must be 0 or greater'),
  isActive: z.boolean(),
})

export type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>

/** Returns { field: message } (empty when valid). */
export function validateTeamMemberForm(values: TeamMemberFormValues): Record<string, string> {
  return collectFieldErrors(teamMemberFormSchema.safeParse(values))
}
