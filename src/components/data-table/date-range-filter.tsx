'use client'

import * as React from 'react'

import { type Column } from '@tanstack/react-table'
import { format } from 'date-fns'
import { CalendarIcon, X } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DataTableDateRangeFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  placeholder?: string
  // Virtual filter props (when column is undefined)
  value?: DateRangeValue
  onValueChange?: (value: DateRangeValue) => void
  // Maximum number of days allowed in the range
  maxRangeDays?: number
  // Override button appearance
  buttonClassName?: string
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon'
}

// Expected format: { from: Date, to: Date } or undefined
type DateRangeValue =
  | {
      from: Date
      to: Date
    }
  | undefined

export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title,
  placeholder = 'Pick a date…',
  value: externalValue,
  onValueChange: externalOnValueChange,
  maxRangeDays,
  buttonClassName,
  buttonSize,
}: DataTableDateRangeFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  // Use external value for virtual filters or column value for table filters
  const filterValue = column ? (column.getFilterValue() as DateRangeValue) : externalValue
  const [date, setDate] = React.useState<DateRange | undefined>(
    filterValue ? { from: filterValue.from, to: filterValue.to } : undefined
  )

  // Update local state when external filter changes
  React.useEffect(() => {
    setDate(filterValue ? { from: filterValue.from, to: filterValue.to } : undefined)
  }, [filterValue])

  const handleSelect = React.useCallback(
    (newDate: DateRange | undefined) => {
      setDate(newDate)

      // Apply filter when both dates are selected, or clear if no date
      if (newDate?.from && newDate?.to) {
        // Only close if the dates are different (single day click sets both to same day)
        const isSameDay = newDate.from.getTime() === newDate.to.getTime()

        const dateValue = {
          from: newDate.from,
          to: newDate.to,
        }
        if (column) {
          column.setFilterValue(dateValue)
        } else {
          externalOnValueChange?.(dateValue)
        }

        // Only close if it's a proper range (different dates)
        if (!isSameDay) {
          setOpen(false)
        }
      } else if (!newDate?.from) {
        // Clear filter when no date is selected
        if (column) {
          column.setFilterValue(undefined)
        } else {
          externalOnValueChange?.(undefined)
        }
      }
      // Do nothing when only 'from' is selected - wait for 'to' date
    },
    [column, externalOnValueChange]
  )

  const isDateDisabled = React.useCallback(
    (day: Date): boolean => {
      if (!maxRangeDays || !date?.from) return false

      const normalize = (d: Date) => {
        const n = new Date(d)
        n.setHours(0, 0, 0, 0)
        return n
      }

      const from = normalize(date.from)
      const to = date.to ? normalize(date.to) : null

      // Range is fully selected (from ≠ to) — no restrictions, allow re-selection
      if (to && to.getTime() !== from.getTime()) return false

      // Only start is selected (or from === to, which is first click in range mode)
      const normalizedDay = normalize(day)
      const maxTo = new Date(from)
      maxTo.setDate(maxTo.getDate() + maxRangeDays)
      return normalizedDay < from || normalizedDay > maxTo
    },
    [maxRangeDays, date]
  )

  const clearFilter = React.useCallback(() => {
    setDate(undefined)
    if (column) {
      column.setFilterValue(undefined)
    } else {
      externalOnValueChange?.(undefined)
    }
    setOpen(false)
  }, [column, externalOnValueChange])

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder

    if (range.to) {
      return `${format(range.from, 'yyyy-MM-dd')} - ${format(range.to, 'yyyy-MM-dd')}`
    }

    return `${format(range.from, 'yyyy-MM-dd')} - ...`
  }

  const hasValue = date?.from && date?.to

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={buttonSize ?? 'sm'}
          className={cn(
            !buttonClassName && 'h-8 min-w-[160px] border-dashed font-normal',
            'justify-between text-left transition-colors',
            'hover:bg-muted/60 hover:border-muted-foreground/50',
            hasValue && 'border-primary bg-primary/5 text-primary hover:bg-primary/10',
            !hasValue && !buttonClassName && 'text-muted-foreground',
            buttonClassName
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm">
              {hasValue ? formatDateRange(date) : title || placeholder}
            </span>
          </div>
          {hasValue && (
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
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-border/50 w-auto p-0 shadow-lg"
        align="start"
        sideOffset={8}
      >
        <div className="p-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium">{title || 'Select a date range'}</h4>
            <p className="text-muted-foreground text-xs">
              {date?.from && !date?.to
                ? 'Select an end date…'
                : 'Select a start and an end date'}
            </p>
          </div>
          <Calendar
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2030}
            disabled={maxRangeDays ? isDateDisabled : undefined}
            className="rounded-md border"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label:
                'flex h-full w-full items-center justify-between px-2 py-1 text-sm [&>svg]:text-muted-foreground [&>svg]:size-3.5 [&>svg]:shrink-0',
              nav: 'space-x-1 flex items-center',
              nav_button: cn('h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
              nav_button_previous: 'absolute left-1',
              nav_button_next: 'absolute right-1',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
              row: 'flex w-full mt-2',
              cell: 'text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
              day: cn('h-9 w-9 p-0 font-normal aria-selected:opacity-100'),
              day_selected:
                'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
              day_today: 'bg-accent text-accent-foreground',
              day_outside: 'text-muted-foreground opacity-50',
              day_disabled: 'text-muted-foreground opacity-50',
              day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
              day_hidden: 'invisible',
            }}
          />
          <div className="flex items-center justify-between border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)} disabled={!hasValue}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
