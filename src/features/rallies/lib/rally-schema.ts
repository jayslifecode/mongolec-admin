import { z } from 'zod'
import { dateOrder, optionalUrl, slug } from '@/lib/validation/rules'

/** The rally form's text inputs, as typed (numbers stay strings until validated). */
export type RallyFormValues = {
  titleEn: string
  slug: string
  startDate: string
  endDate: string
  applicationDeadline: string
  duration: string
  maxParticipants: string
  photoCredit: string
  heroVideo: string
  isFeatured: boolean
  currency: string
  minimumContribution: string
  deposit: string
  nonRefundable: string
  finalPaymentDue: string
}

export const PHOTO_CREDIT_MAX = 200

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Parses "11,000" style text. Returns null when empty, NaN when not a number. */
export function parseAmount(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, '')
  if (!cleaned) return null
  return Number(cleaned)
}

const isRealDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

const requiredDate = (label: string) =>
  z.string().min(1, `Choose the ${label}`).refine(isRealDate, `Enter a valid ${label}`)

const optionalDate = (label: string) =>
  z.string().refine((v) => v === '' || isRealDate(v), `Enter a valid ${label}`)

const optionalAmount = (label: string) =>
  z.string().superRefine((text, ctx) => {
    const amount = parseAmount(text)
    if (amount === null) return
    if (Number.isNaN(amount)) ctx.addIssue({ code: 'custom', message: `${label} must be a number` })
    else if (amount < 0) ctx.addIssue({ code: 'custom', message: `${label} cannot be negative` })
  })

const rallyFormSchema = z
  .object({
    titleEn: z.string().trim().min(1, 'Enter the English title'),
    slug,
    startDate: requiredDate('start date'),
    endDate: requiredDate('end date'),
    applicationDeadline: optionalDate('application deadline'),
    duration: z.string().refine((v) => {
      const n = v.trim() === '' ? 0 : Number(v)
      return Number.isInteger(n) && n >= 0
    }, 'Duration must be a whole number, 0 or more'),
    maxParticipants: z.string().refine((v) => {
      if (v.trim() === '') return true
      const n = Number(v)
      return Number.isInteger(n) && n >= 1
    }, 'Enter at least 1, or leave empty for unlimited'),
    photoCredit: z.string().max(PHOTO_CREDIT_MAX, `Keep the photo credit under ${PHOTO_CREDIT_MAX} characters`),
    heroVideo: optionalUrl,
    isFeatured: z.boolean(),
    currency: z.string().trim().refine((v) => v === '' || /^[A-Za-z]{3}$/.test(v), 'Use a 3-letter code such as USD'),
    minimumContribution: optionalAmount('Minimum contribution'),
    deposit: optionalAmount('Deposit'),
    nonRefundable: optionalAmount('Non-refundable part'),
    finalPaymentDue: optionalDate('final payment date'),
  })
  .superRefine(dateOrder<RallyFormValues>('startDate', 'endDate', 'The end date must be on or after the start date'))
  .superRefine((v, ctx) => {
    if (v.applicationDeadline && v.startDate && v.applicationDeadline > v.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['applicationDeadline'],
        message: 'The application deadline must be on or before the start date',
      })
    }
    const minimum = parseAmount(v.minimumContribution)
    const deposit = parseAmount(v.deposit)
    const nonRefundable = parseAmount(v.nonRefundable)
    if (minimum !== null && deposit !== null && deposit > minimum) {
      ctx.addIssue({ code: 'custom', path: ['deposit'], message: 'The deposit cannot be more than the minimum contribution' })
    }
    if (deposit !== null && nonRefundable !== null && nonRefundable > deposit) {
      ctx.addIssue({ code: 'custom', path: ['nonRefundable'], message: 'The non-refundable part cannot be more than the deposit' })
    }
  })

export interface RallyValidation {
  errors: Partial<Record<keyof RallyFormValues, string>>
}

/** First message per field. An empty `errors` object means the form is valid. */
export function validateRallyForm(values: RallyFormValues): RallyValidation {
  const result = rallyFormSchema.safeParse(values)
  const errors: RallyValidation['errors'] = {}
  if (result.success) return { errors }
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof RallyFormValues | undefined
    if (key && !errors[key]) errors[key] = issue.message
  }
  return { errors }
}
