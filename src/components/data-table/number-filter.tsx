'use client'

import * as React from 'react'

import { type Column } from '@tanstack/react-table'
import { Hash, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type NumberFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  min?: number
  max?: number
  step?: number
  // Virtual filter props (when column is undefined)
  value?: string | number
  onValueChange?: (value: number | undefined) => void
}

export function DataTableNumberFilter<TData, TValue>({
  column,
  title,
  placeholder = 'Number…',
  icon: Icon = Hash,
  min,
  max,
  step = 1,
  value: externalValue,
  onValueChange: externalOnValueChange,
}: NumberFilterProps<TData, TValue>) {
  const [inputValue, setInputValue] = React.useState('')

  const filterValue = column ? (column.getFilterValue() as string) : externalValue

  React.useEffect(() => {
    const valString = filterValue?.toString() || ''
    if (valString !== inputValue) {
      setInputValue(valString)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue])

  // Debounce the actual filter application
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const numValue = parseFloat(inputValue)
      const newValue = !isNaN(numValue) ? numValue : undefined

      // Only apply if the value is different from the current filter value
      const currentVal = column ? column.getFilterValue() : externalValue
      if (currentVal !== newValue) {
        if (column) {
          column.setFilterValue(newValue)
        } else {
          externalOnValueChange?.(newValue)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inputValue, column, externalOnValueChange, externalValue])

  const clearFilter = React.useCallback(() => {
    if (column) {
      column.setFilterValue(undefined)
    } else {
      externalOnValueChange?.(undefined)
    }
    setInputValue('')
  }, [column, externalOnValueChange])

  const hasValue = filterValue !== undefined && filterValue !== null && filterValue !== ''

  return (
    <div
      className={cn(
        'bg-background relative flex h-8 min-w-[150px] items-center rounded-md border border-dashed transition-colors duration-200',
        'hover:bg-muted/60 hover:border-muted-foreground/50',
        hasValue && 'border-primary bg-primary/5'
      )}
    >
      <div className="flex h-full w-full items-center px-2">
        <Icon
          className={cn(
            'mr-2 h-4 w-4 shrink-0',
            hasValue ? 'text-primary' : 'text-muted-foreground'
          )}
        />
        <Input
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (['e', 'E', '+', '-'].includes(e.key)) {
              e.preventDefault()
            }
          }}
          placeholder={title || placeholder}
          min={min}
          max={max}
          step={step}
          className={cn(
            'h-full border-0 p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0',
            hasValue ? 'text-primary font-medium' : 'text-muted-foreground'
          )}
        />
        {hasValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearFilter}
            className="h-4 w-4 rounded-sm p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
