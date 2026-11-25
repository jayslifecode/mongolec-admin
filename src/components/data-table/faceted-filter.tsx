'use client'

import * as React from 'react'

import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'
import { type Column } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  // Virtual filter props (when column is undefined)
  value?: string[]
  onValueChange?: (value: string[] | undefined) => void
  variant?: 'default' | 'simple'
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  value: externalValue,
  onValueChange: externalOnValueChange,
  variant = 'default',
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues()

  // Use external value for virtual filters or column value for table filters
  const filterValue = column ? (column.getFilterValue() as string[]) : externalValue

  const selectedValues = React.useMemo(() => {
    return new Set(filterValue || [])
  }, [filterValue])

  const handleOptionSelect = React.useCallback(
    (optionValue: string, isSelected: boolean) => {
      const currentValues = Array.from(selectedValues)
      let newValues: string[]

      if (isSelected) {
        newValues = currentValues.filter(value => value !== optionValue)
      } else {
        newValues = [...currentValues, optionValue]
      }

      const finalValue = newValues.length ? newValues : undefined

      if (column) {
        column.setFilterValue(finalValue)
      } else {
        externalOnValueChange?.(finalValue)
      }
    },
    [selectedValues, column, externalOnValueChange]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 border-dashed transition-colors',
            'hover:bg-muted/60 hover:border-muted-foreground/50',
            selectedValues?.size > 0 &&
              'border-primary bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          <PlusCircledIcon className="mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && variant !== 'simple' && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0 text-xs font-medium lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-full px-2 py-0 text-xs font-medium">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter(option => selectedValues.has(option.value))
                    .slice(0, 2)
                    .map(option => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="flex items-center gap-1 rounded-full px-2 py-0 text-xs font-medium"
                      >
                        {option.icon && <option.icon className="h-3 w-3" />}
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
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
              No options found.
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selectedValues.has(option.value)
                const count = facets?.get(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleOptionSelect(option.value, isSelected)}
                    className="hover:bg-muted/60 flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors"
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded border-2 transition-colors',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-muted-foreground/60'
                      )}
                    >
                      <CheckIcon className={cn('h-3 w-3', !isSelected && 'invisible')} />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <span className="flex-1 truncate">{option.label}</span>
                    {count && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 rounded-full px-1.5 font-mono text-xs"
                      >
                        {count}
                      </Badge>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator className="mx-2" />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      if (column) {
                        column.setFilterValue(undefined)
                      } else {
                        externalOnValueChange?.(undefined)
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground mb-1 cursor-pointer justify-center py-2 text-center"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
