'use client'

import React from 'react'

import { type Table } from '@tanstack/react-table'
import { Calendar, Check, ChevronDown, Filter, Hash, ToggleLeft, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { DataTableAutocompleteSelectFilter } from './autocomplete-select-filter'
import { DataTableBooleanFilter } from './boolean-filter'
import { DataTableDateFilter } from './date-filter'
import { DataTableDateRangeFilter } from './date-range-filter'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableInputFilter } from './input-filter'
import { DataTableNumberFilter } from './number-filter'
import { DataTableSingleSelectFilter } from './single-select-filter'
import { VirtualFilterValue } from './toolbar'

export interface DataTableFilterField {
  columnId: string
  title: string
  type?:
    | 'select'
    | 'single-select'
    | 'faceted'
    | 'autocomplete-select'
    | 'input'
    | 'date-range'
    | 'date'
    | 'number'
    | 'boolean'
    | 'text'
    | 'multiSelect'
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  multiple?: boolean
  customQuery?:
    | import('./autocomplete-select-filter').CustomQueryConfig
    | import('./autocomplete-select-filter').TypedCustomQueryConfig
  startDateKey?: string
  endDateKey?: string
  min?: number
  max?: number
  step?: number
  trueLabel?: string
  falseLabel?: string
  maxDate?: Date | 'today' // Maximum allowed date for date filters
  minDate?: Date | 'today' // Minimum allowed date for date filters
  dependsOn?: string[] // Array of filter columnIds this filter depends on
  options?: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  hideOnPaths?: string[]
  isHidden?: boolean
}

interface DataTableFilterItemProps<TData> {
  table: Table<TData>
  filter: DataTableFilterField
  virtualFilterValues?: Record<string, VirtualFilterValue>
  onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
  fullWidth?: boolean
}

export function SimpleFilter<TData>({
  table,
  filter,
  virtualFilterValues = {},
  onVirtualFilterChange,
  fullWidth = false,
}: DataTableFilterItemProps<TData>) {
  const [open, setOpen] = React.useState(false)
  const allColumns = table.getAllColumns()
  const columnExists = allColumns.some(col => col.id === filter.columnId)

  const isVirtualFilter =
    filter.type === 'autocomplete-select' ||
    filter.type === 'date-range' ||
    filter.type === 'date' ||
    filter.type === 'number' ||
    filter.type === 'boolean' ||
    filter.type === 'input' ||
    filter.type === 'text' ||
    filter.type === 'single-select' ||
    filter.type === 'select' ||
    filter.type === 'faceted' ||
    filter.type === 'multiSelect'

  let column = undefined
  if (!isVirtualFilter) {
    if (!columnExists) return null
    column = table.getColumn(filter.columnId)
    if (!column) return null
  }

  const value = virtualFilterValues[filter.columnId]
  const isFiltered =
    value !== undefined &&
    value !== null &&
    value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true)

  // Map user-friendly types to internal types
  const type =
    filter.type === 'text'
      ? 'input'
      : filter.type === 'select'
        ? 'single-select'
        : filter.type === 'multiSelect'
          ? 'faceted'
          : filter.type

  // Default icons for types
  const Icon =
    filter.icon ||
    (type === 'input'
      ? Type
      : type === 'number'
        ? Hash
        : type === 'date'
          ? Calendar
          : type === 'boolean'
            ? ToggleLeft
            : Filter)

  const renderFilterContent = () => {
    switch (type) {
      case 'input':
        return (
          <DataTableInputFilter
            column={column}
            title={filter.title}
            placeholder={filter.placeholder || `${filter.title}...`}
            value={value as string}
            onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
            fullWidth={true}
          />
        )
      case 'number':
        return (
          <DataTableNumberFilter
            column={undefined}
            title={filter.title}
            placeholder={filter.placeholder}
            icon={filter.icon}
            min={filter.min}
            max={filter.max}
            step={filter.step}
            value={value as string | number}
            onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
          />
        )
      case 'single-select':
        return (
          <DataTableSingleSelectFilter
            column={column}
            title={filter.title}
            placeholder={filter.placeholder}
            options={filter.options || []}
            value={value as string}
            onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
            fullWidth={true}
            variant="simple"
          />
        )
      case 'faceted':
        return (
          <DataTableFacetedFilter
            column={undefined}
            title={filter.title}
            options={filter.options || []}
            value={value as string[]}
            onValueChange={val =>
              onVirtualFilterChange?.(filter.columnId, val as VirtualFilterValue)
            }
            variant="simple"
          />
        )
      case 'date':
        // Compute dynamic minDate if filter depends on another date filter
        let computedMinDate = filter.minDate
        if (filter.dependsOn && filter.dependsOn.includes('startDate')) {
          const startDateValue = virtualFilterValues['startDate'] as string | undefined
          if (startDateValue) {
            computedMinDate = new Date(startDateValue)
          }
        }

        return (
          <DataTableDateFilter
            column={undefined}
            title={filter.title}
            placeholder={filter.placeholder}
            icon={filter.icon}
            value={value as string}
            onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
            variant="simple"
            maxDate={filter.maxDate}
            minDate={computedMinDate}
          />
        )
      case 'boolean':
        return (
          <DataTableBooleanFilter
            column={undefined}
            title={filter.title}
            placeholder={filter.placeholder}
            icon={filter.icon}
            trueLabel={filter.trueLabel}
            falseLabel={filter.falseLabel}
            value={value as boolean | string}
            onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
            variant="simple"
          />
        )
      case 'autocomplete-select':
        if (!filter.customQuery) return null
        return (
          <DataTableAutocompleteSelectFilter
            value={(value as string | string[]) ?? ''}
            onChange={val =>
              onVirtualFilterChange?.(filter.columnId, val as VirtualFilterValue)
            }
            customQuery={filter.customQuery}
            placeholder={filter.placeholder}
            isMulti={filter.multiple}
          />
        )
      case 'date-range':
        return (
          <div className="p-2">
            <DataTableDateRangeFilter
              column={undefined}
              title={filter.title}
              placeholder={filter.placeholder}
              value={value as { from: Date; to: Date } | undefined}
              onValueChange={val => onVirtualFilterChange?.(filter.columnId, val)}
            />
          </div>
        )
      default:
        return null
    }
  }

  // Types that already have their own popover/trigger logic OR should be rendered directly (inputs)
  const isDirectlyRendered =
    type === 'single-select' ||
    type === 'faceted' ||
    type === 'date' ||
    type === 'date-range' ||
    type === 'boolean' ||
    type === 'autocomplete-select' ||
    type === 'input' ||
    type === 'number'

  if (isDirectlyRendered) {
    return renderFilterContent()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 justify-between border-dashed px-2 transition-colors',
            'hover:bg-muted/60 hover:border-muted-foreground/50',
            fullWidth ? 'w-full' : 'w-auto',
            isFiltered && 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <Icon
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                isFiltered ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <span className="truncate">{filter.title}</span>
          </div>
          <div className="ml-2 flex shrink-0 items-center gap-1.5">
            {isFiltered && (
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3" />
              </div>
            )}
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')}
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-border/50 w-[240px] p-0 shadow-xl"
        align="start"
        sideOffset={8}
      >
        {renderFilterContent()}
      </PopoverContent>
    </Popover>
  )
}
