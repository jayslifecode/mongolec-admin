export interface FieldState {
  error?: string | null
  description?: string | null
  required?: boolean
}

export interface FieldControlProps {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
  'aria-required'?: true
}

export const fieldErrorId = (id: string) => `${id}-error`
export const fieldDescriptionId = (id: string) => `${id}-description`

/**
 * Accessibility attributes for a form control: links its error message (first) and hint so
 * screen readers announce them, and marks invalid and required fields.
 */
export function fieldControlProps(id: string, { error, description, required }: FieldState): FieldControlProps {
  const describedBy = [error ? fieldErrorId(id) : null, description ? fieldDescriptionId(id) : null]
    .filter(Boolean)
    .join(' ')
  return {
    id,
    ...(error && { 'aria-invalid': true as const }),
    ...(describedBy && { 'aria-describedby': describedBy }),
    ...(required && { 'aria-required': true as const }),
  }
}
