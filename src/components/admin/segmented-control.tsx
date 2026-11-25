import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  /** Accessible name when the visible label is an abbreviation (e.g. "MN" -> "Mongolian"). */
  ariaLabel?: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  ariaLabel: string
  className?: string
}

/**
 * A row of toggle buttons for switching a filter or language. Use this instead of tabs when
 * there are no tab panels: each button says whether it is pressed, and the group is labelled.
 */
export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('bg-muted text-muted-foreground inline-flex h-8 items-center rounded-lg p-0.5', className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={option.ariaLabel}
            onClick={() => onValueChange(option.value)}
            className={cn(
              'h-7 rounded-md px-3 text-xs font-medium transition-colors',
              isSelected ? 'bg-background text-foreground shadow-xs' : 'hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
