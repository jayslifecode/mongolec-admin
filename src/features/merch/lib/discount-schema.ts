import { z } from 'zod'
import { dateOrder } from '@/lib/validation/rules'

const PERCENT_MAX = 100

export interface DiscountFormInput {
  name: string
  type: 'PERCENT' | 'AMOUNT'
  value: string
  startDate: string
  endDate: string
}

const discountSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a name').max(120, 'Keep the name under 120 characters'),
    type: z.enum(['PERCENT', 'AMOUNT']),
    value: z
      .string()
      .trim()
      .min(1, 'Enter a value')
      .transform((v) => Number(v))
      .pipe(z.number({ message: 'Enter a number' }).refine(Number.isFinite, 'Enter a number')),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
  })
  .superRefine((value, ctx) => {
    if (value.value <= 0) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'The value must be more than 0' })
    } else if (value.type === 'PERCENT' && value.value > PERCENT_MAX) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'A percentage discount cannot be more than 100' })
    }
  })
  .superRefine(dateOrder('startDate', 'endDate', 'The end date must be on or after the start date'))

export interface DiscountValidationResult {
  fieldErrors: Record<string, string>
  data?: z.output<typeof discountSchema>
}

export function validateDiscountForm(values: DiscountFormInput): DiscountValidationResult {
  const result = discountSchema.safeParse(values)
  if (result.success) return { fieldErrors: {}, data: result.data }
  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    fieldErrors[String(issue.path[0] ?? 'form')] ??= issue.message
  }
  return { fieldErrors }
}
