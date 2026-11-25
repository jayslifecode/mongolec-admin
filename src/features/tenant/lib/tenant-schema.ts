import { z } from 'zod'
import { slug } from '@/lib/validation/rules'

const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

/** "HTTPS://Example.com/path" -> "example.com". Lets people paste a link into the domain field. */
export function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[/?#].*$/, '')
}

const domain = z
  .string()
  .transform(normalizeDomain)
  .refine((value) => value === '' || HOSTNAME_PATTERN.test(value), 'Enter a domain like example.com')

export const tenantSchema = z.object({
  name: z.string().trim().min(1, 'Enter the organization name').max(120, 'Keep the name under 120 characters'),
  slug,
  domain,
})

export type TenantFormValues = z.input<typeof tenantSchema>

export interface TenantValidationResult {
  fieldErrors: Record<string, string>
  data?: z.output<typeof tenantSchema>
}

/** Validates the form and returns the first message per field. */
export function validateTenantForm(values: TenantFormValues): TenantValidationResult {
  const result = tenantSchema.safeParse(values)
  if (result.success) return { fieldErrors: {}, data: result.data }
  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    fieldErrors[key] ??= issue.message
  }
  return { fieldErrors }
}
