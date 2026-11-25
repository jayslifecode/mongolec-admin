'use client'

import * as React from 'react'

import { type Column } from '@tanstack/react-table'
import { Check, ChevronsUpDown, ToggleLeft, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type BooleanFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  trueLabel?: string
  falseLabel?: string
  // Virtual filter props (when column is undefined)
  value?: boolean | string
  onValueChange?: (value: boolean | undefined) => void
  variant?: 'default' | 'simple'
}

export function DataTableBooleanFilter<TData, TValue>({
  column,
  title,
  placeholder = 'Select a value…',
  icon: Icon = ToggleLeft,
  trueLabel = 'Yes',
  falseLabel = 'No',
  value: externalValue,
  onValueChange: externalOnValueChange,
  variant = 'default',
}: BooleanFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  // Use external value for virtual filters or column value for table filters
  const filterValue = column ? (column.getFilterValue() as string) : externalValue

  // Customize options with provided labels
  const options = React.useMemo(
    () => [
      {
        value: 'true',
        label: trueLabel,
        icon: Check,
      },
      {
        value: 'false',
        label: falseLabel,
        icon: X,
      },
    ],
    [trueLabel, falseLabel]
  )

  const selectedOption = React.useMemo(() => {
    return options.find(option => option.value === String(filterValue))
  }, [options, filterValue])

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      const isCurrentValue = String(filterValue) === optionValue
      if (column) {
        const newValue = isCurrentValue ? undefined : optionValue
        column.setFilterValue(newValue)
      } else {
        const newBooleanValue = isCurrentValue ? undefined : optionValue === 'true'
        externalOnValueChange?.(newBooleanValue)
      }
      setOpen(false)
    },
    [filterValue, column, externalOnValueChange]
  )

  const clearFilter = React.useCallback(() => {
    if (column) {
      column.setFilterValue(undefined)
    } else {
      externalOnValueChange?.(undefined)
    }
  }, [column, externalOnValueChange])

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
            selectedOption && 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
            {selectedOption && variant !== 'simple' ? (
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <selectedOption.icon className="h-4 w-4" />
                <span className="truncate font-medium">{selectedOption.label}</span>
              </div>
            ) : (
              <span className="text-muted-foreground truncate">{title || placeholder}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {selectedOption && (
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
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start" sideOffset={8}>
        <Command className="rounded-lg">
          <CommandList>
            <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
              No options
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors"
                  >
                    <option.icon className="text-muted-foreground h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">{option.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
