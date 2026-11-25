import type { ZodSafeParseResult } from 'zod'

/** Flattens a zod result into { fieldName: firstMessage } (empty when valid). */
export function collectFieldErrors(result: ZodSafeParseResult<unknown>): Record<string, string> {
  if (result.success) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (!(key in errors)) errors[key] = issue.message
  }
  return errors
}
