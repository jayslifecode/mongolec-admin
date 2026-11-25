'use client'

import * as React from 'react'

import { ChevronDownIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DataTableSingleSelectFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  placeholder?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  // Virtual filter props (when column is undefined)
  value?: string
  onValueChange?: (value: string | undefined) => void
  fullWidth?: boolean
  variant?: 'default' | 'simple'
}

export function DataTableSingleSelectFilter<TData, TValue>({
  column,
  title,
  placeholder = 'Select…',
  options,
  value: externalValue,
  onValueChange: externalOnValueChange,
  fullWidth = false,
  variant = 'default',
}: DataTableSingleSelectFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false)

  // Use external value for virtual filters or column value for table filters
  const filterValue = column ? (column.getFilterValue() as string) : externalValue
  const selectedOption = options.find(option => option.value === filterValue)

  const handleSelect = React.useCallback(
    (optionValue: string) => {
      const newValue = filterValue === optionValue ? undefined : optionValue
      if (column) {
        column.setFilterValue(newValue)
      } else {
        externalOnValueChange?.(newValue)
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
            'h-8 min-w-[120px] justify-between border shadow-none transition-colors',
            'bg-background hover:bg-muted/60 hover:border-muted-foreground/50',
            fullWidth ? 'w-full' : 'w-auto',
            selectedOption && 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon && <selectedOption.icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">
              {variant === 'simple'
                ? title || placeholder
                : selectedOption
                  ? selectedOption.label
                  : title || placeholder}
            </span>
          </div>
          <div className="flex items-center gap-1">
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
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-border/50 w-[240px] p-0 shadow-lg"
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-lg">
          <CommandInput
            placeholder={`Search ${title?.toLowerCase()}...`}
            className="h-9 border-0 focus:ring-0"
          />
          <CommandList className="max-h-64">
            <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
              No results
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors"
                  >
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
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
