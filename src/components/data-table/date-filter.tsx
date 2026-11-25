'use client'

import * as React from 'react'

import { type Column } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Calendar, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DateFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  // Virtual filter props (when column is undefined)
  value?: string
  onValueChange?: (value: string | undefined) => void
  variant?: 'default' | 'simple'
  // Date validation - can be Date or special string 'today'
  maxDate?: Date | 'today' // Maximum allowed date (e.g., 'today' for startDate)
  minDate?: Date | 'today' // Minimum allowed date
}

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
  placeholder = 'Pick a date…',
  icon: Icon = Calendar,
  value: externalValue,
  onValueChange: externalOnValueChange,
  variant = 'default',
  maxDate,
  minDate,
}: DateFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  // Create a stable key to force remount when maxDate/minDate changes
  const dateConstraintKey = React.useMemo(() => {
    const max = maxDate === 'today' ? 'today' : maxDate?.toISOString()
    const min = minDate === 'today' ? 'today' : minDate?.toISOString()
    return `${max}-${min}`
  }, [maxDate, minDate])

  // Use external value for virtual filters or column value for table filters
  const filterValue = column ? (column.getFilterValue() as string) : externalValue

  const selectedDate = React.useMemo(() => {
    return filterValue ? new Date(filterValue) : undefined
  }, [filterValue])

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      let newValue: string | undefined
      if (date) {
        // Format as YYYY-MM-DD
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        newValue = `${year}-${month}-${day}`
      } else {
        newValue = undefined
      }

      if (column) {
        column.setFilterValue(newValue)
      } else {
        externalOnValueChange?.(newValue)
      }
      setOpen(false)
    },
    [column, externalOnValueChange]
  )

  const clearFilter = React.useCallback(() => {
    if (column) {
      column.setFilterValue(undefined)
    } else {
      externalOnValueChange?.(undefined)
    }
  }, [column, externalOnValueChange])

  // Disable dates that are outside the allowed range
  const isDateDisabled = React.useCallback(
    (date: Date): boolean => {
      // Resolve 'today' to current date (normalized to midnight)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const resolvedMaxDate = maxDate === 'today' ? today : maxDate
      const resolvedMinDate = minDate === 'today' ? today : minDate

      // Normalize the input date to midnight for accurate comparison
      const normalizedDate = new Date(date)
      normalizedDate.setHours(0, 0, 0, 0)

      const disabled =
        (resolvedMaxDate && normalizedDate > resolvedMaxDate) ||
        (resolvedMinDate && normalizedDate < resolvedMinDate)

      return !!disabled // Ensure we always return a boolean
    },
    [maxDate, minDate]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'h-8 min-w-[200px] justify-between border-dashed transition-colors',
            'hover:bg-muted/60 hover:border-muted-foreground/50',
            selectedDate && 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
            {selectedDate && variant !== 'simple' ? (
              <span className="truncate font-medium">{format(selectedDate, 'yyyy-MM-dd')}</span>
            ) : (
              <span className="text-muted-foreground truncate">{title || placeholder}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {selectedDate && (
              <div
                role="button"
                tabIndex={0}
                onClick={e => {
                  e.stopPropagation()
                  clearFilter()
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    clearFilter()
                  }
                }}
                className="hover:bg-muted/20 flex h-4 w-4 cursor-pointer items-center justify-center rounded transition-colors"
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <Calendar className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          key={dateConstraintKey}
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          captionLayout="dropdown"
          fromYear={1950}
          toYear={2030}
          disabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  )
}
