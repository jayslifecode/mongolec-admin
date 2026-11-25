import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { toneClasses, type StatusTone } from '@/lib/ui/status-tones'

interface StatusBadgeProps {
  tone?: StatusTone
  children: ReactNode
  className?: string
}

/** A status chip: text on a tinted background. Colour only for meaning (see status-tones). */
export function StatusBadge({ tone = 'neutral', children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClasses(tone),
        className
      )}
    >
      {children}
    </span>
  )
}
