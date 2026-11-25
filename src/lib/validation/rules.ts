import { z } from 'zod'

/** Shared input rules for admin forms. Messages are written for the person filling the form. */

export const slug = z
  .string()
  .trim()
  .min(1, 'Enter a URL name')
  .max(100, 'Keep the URL name under 100 characters')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single dashes (e.g. mongolia-2027)')

/** Empty, or a full http(s) URL. Rejects "linkedin.com/x" (no scheme) and javascript: links. */
export const optionalUrl = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .url({ protocol: /^https?$/, message: 'Enter a full link starting with https://' }),
])

export const email = z.string().trim().email('Enter a valid email address')

export const money = z
  .number({ message: 'Enter an amount' })
  .min(0, 'The amount cannot be negative')
  .refine((n) => Math.round(n * 100) === n * 100, 'Use at most two decimals')

export const percent = z
  .number({ message: 'Enter a percentage' })
  .min(0, 'The percentage cannot be negative')
  .max(100, 'The percentage cannot be more than 100')

export const phone = z
  .string()
  .trim()
  .regex(/^[+()\d][\d\s()+-]{5,19}$/, 'Enter a phone number with digits (spaces, +, - and brackets are fine)')

/**
 * superRefine helper: reports `message` on `endKey` when both dates are set and the end is
 * before the start. Works with ISO date or datetime strings.
 */
export function dateOrder<T extends Record<string, unknown>>(startKey: keyof T & string, endKey: keyof T & string, message: string) {
  return (value: T, ctx: z.RefinementCtx) => {
    const start = value[startKey]
    const end = value[endKey]
    if (typeof start !== 'string' || typeof end !== 'string' || !start || !end) return
    if (new Date(end).getTime() < new Date(start).getTime()) {
      ctx.addIssue({ code: 'custom', path: [endKey], message })
    }
  }
}
