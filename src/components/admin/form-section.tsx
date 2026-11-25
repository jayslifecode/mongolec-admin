import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export function FormSection({ title, description, children, className, actions }: FormSectionProps) {
  return (
    <section className={cn('rounded-xl border border-border bg-card overflow-hidden', className)}>
      <div className="flex items-start justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="ml-4 shrink-0">{actions}</div>}
      </div>
      <div className="p-5 space-y-5">
        {children}
      </div>
    </section>
  )
}
