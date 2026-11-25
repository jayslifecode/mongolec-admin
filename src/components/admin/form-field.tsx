import { type ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  fieldControlProps,
  fieldDescriptionId,
  fieldErrorId,
  type FieldControlProps,
} from '@/lib/ui/field-props'

interface FormFieldProps {
  id: string
  label: ReactNode
  required?: boolean
  description?: string | null
  error?: string | null
  className?: string
  /** Render the control with these props spread on it (id, aria-invalid, aria-describedby...). */
  children: (control: FieldControlProps) => ReactNode
}

/**
 * One form field: label (linked), control, hint and inline error. The error is announced to
 * screen readers and the control is marked invalid, so nothing relies on colour alone.
 *
 *   <FormField id="title" label="Title" required error={errors.title}>
 *     {(props) => <Input {...props} value={title} onChange={...} />}
 *   </FormField>
 */
export function FormField({ id, label, required, description, error, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children(fieldControlProps(id, { error, description, required }))}
      {error && (
        <p id={fieldErrorId(id)} role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      {description && (
        <p id={fieldDescriptionId(id)} className="text-muted-foreground text-xs">
          {description}
        </p>
      )}
    </div>
  )
}
