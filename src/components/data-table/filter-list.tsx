'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { type Table } from '@tanstack/react-table'
import { Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFilterLabelStore } from '@/stores/filter-label-store'

import { AutocompleteSelectFilter } from './autocomplete-select-filter'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | import('./autocomplete-select-filter').TypedCustomQueryConfig
  startDateKey?: string
  endDateKey?: string
  min?: number
  max?: number
  step?: number
  trueLabel?: string
  falseLabel?: string
  maxDate?: Date | 'today'
  minDate?: Date | 'today'
  dependsOn?: string[]
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

export function DataTableFilterItem<TData>({
  table,
  filter,
  virtualFilterValues = {},
  onVirtualFilterChange,
  fullWidth = false,
}: DataTableFilterItemProps<TData>) {
  const allColumns = table.getAllColumns()
  const columnExists = allColumns.some(col => col.id === filter.columnId)

  const isVirtualFilter =
    filter.type === 'autocomplete-select' ||
    filter.type === 'date-range' ||
    filter.type === 'date' ||
    filter.type === 'number' ||
    filter.type === 'boolean' ||
    filter.type === 'input' ||
    filter.type === 'single-select' ||
    filter.type === 'faceted'

  let column = undefined
  if (!isVirtualFilter) {
    if (!columnExists) return null
    column = table.getColumn(filter.columnId)
    if (!column) return null
  }

  const type =
    filter.type === 'text'
      ? 'input'
      : filter.type === 'select'
        ? 'single-select'
        : filter.type === 'multiSelect'
          ? 'faceted'
          : filter.type

  if (type === 'input') {
    return (
      <DataTableInputFilter
        key={filter.columnId}
        column={column}
        title={filter.title}
        placeholder={filter.placeholder || `${filter.title}...`}
        value={virtualFilterValues[filter.columnId] as string}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
        fullWidth={fullWidth}
      />
    )
  }

  if (type === 'single-select') {
    return (
      <DataTableSingleSelectFilter
        key={filter.columnId}
        column={column}
        title={filter.title}
        placeholder={filter.placeholder}
        options={filter.options || []}
        value={virtualFilterValues[filter.columnId] as string}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
        fullWidth={fullWidth}
        variant="simple"
      />
    )
  }

  if (filter.type === 'autocomplete-select' && filter.customQuery) {
    return (
      <AutocompleteSelectFilter
        key={filter.columnId}
        placeholder={filter.placeholder}
        customQuery={filter.customQuery}
        isMulti={filter.multiple}
        value={virtualFilterValues[filter.columnId] as string | string[]}
        onChange={value =>
          onVirtualFilterChange?.(filter.columnId, value as VirtualFilterValue)
        }
      />
    )
  }

  if (filter.type === 'date-range') {
    return (
      <DataTableDateRangeFilter
        key={filter.columnId}
        column={undefined}
        title={filter.title}
        placeholder={filter.placeholder}
        value={virtualFilterValues[filter.columnId] as { from: Date; to: Date } | undefined}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
      />
    )
  }

  if (type === 'date') {
    let computedMinDate = filter.minDate
    if (filter.dependsOn && filter.dependsOn.includes('startDate')) {
      const startDateValue = virtualFilterValues['startDate'] as string | undefined
      if (startDateValue) {
        computedMinDate = new Date(startDateValue)
      }
    }

    return (
      <DataTableDateFilter
        key={filter.columnId}
        column={undefined}
        title={filter.title}
        placeholder={filter.placeholder}
        icon={filter.icon}
        value={virtualFilterValues[filter.columnId] as string}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
        variant="simple"
        maxDate={filter.maxDate}
        minDate={computedMinDate}
      />
    )
  }

  if (filter.type === 'number') {
    return (
      <DataTableNumberFilter
        key={filter.columnId}
        column={undefined}
        title={filter.title}
        placeholder={filter.placeholder}
        icon={filter.icon}
        min={filter.min}
        max={filter.max}
        step={filter.step}
        value={virtualFilterValues[filter.columnId] as string | number}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
      />
    )
  }

  if (type === 'boolean') {
    return (
      <DataTableBooleanFilter
        key={filter.columnId}
        column={undefined}
        title={filter.title}
        placeholder={filter.placeholder}
        icon={filter.icon}
        trueLabel={filter.trueLabel}
        falseLabel={filter.falseLabel}
        value={virtualFilterValues[filter.columnId] as boolean | string}
        onValueChange={value => onVirtualFilterChange?.(filter.columnId, value)}
        variant="simple"
      />
    )
  }

  if (type === 'faceted') {
    return (
      <DataTableFacetedFilter
        key={filter.columnId}
        column={undefined}
        title={filter.title}
        options={filter.options || []}
        value={virtualFilterValues[filter.columnId] as string[]}
        onValueChange={value =>
          onVirtualFilterChange?.(filter.columnId, value as VirtualFilterValue)
        }
        variant="simple"
      />
    )
  }

  return (
    <DataTableFacetedFilter
      key={filter.columnId}
      column={column}
      title={filter.title}
      options={filter.options || []}
    />
  )
}

interface DataTableFilterListProps<TData> {
  table: Table<TData>
  filters: DataTableFilterField[]
  virtualFilterValues?: Record<string, VirtualFilterValue>
  onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
  onClearAllVirtualFilters?: () => void
  isFiltered: boolean
  className?: string
}

export function DataTableFilterList<TData>({
  table,
  filters,
  virtualFilterValues = {},
  onVirtualFilterChange,
  onClearAllVirtualFilters,
  isFiltered,
  className,
}: DataTableFilterListProps<TData>) {
  const pathname = usePathname()

  const filterVisibility = React.useMemo<Record<string, boolean>>(() => {
    const visibility: Record<string, boolean> = {}

    filters.forEach(filter => {
      if (filter.isHidden) {
        visibility[filter.columnId] = false
        return
      }
      visibility[filter.columnId] = true
    })

    return visibility
  }, [filters])

  const clearAllFilters = React.useCallback(() => {
    table.resetColumnFilters()
    onClearAllVirtualFilters?.()
  }, [table, onClearAllVirtualFilters])

  if (!filters.length && !isFiltered) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters
        .filter(filter => {
          if (
            filter.hideOnPaths &&
            filter.hideOnPaths.some((path: string) => pathname.includes(path))
          ) {
            return false
          }
          return true
        })
        .filter(filter => filterVisibility[filter.columnId] !== false)
        .map(filter => (
          <DataTableFilterItem
            key={filter.columnId}
            table={table}
            filter={filter}
            virtualFilterValues={virtualFilterValues}
            onVirtualFilterChange={onVirtualFilterChange}
          />
        ))}

      {isFiltered && (
        <Button
          size="sm"
          variant="ghost"
          onClick={clearAllFilters}
          className="h-8 px-2 text-danger hover:bg-danger-muted hover:text-danger"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}

interface DataTableFilterSummaryProps<TData> {
  table: Table<TData>
  filters: DataTableFilterField[]
  virtualFilterValues?: Record<string, VirtualFilterValue>
  onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
  onClearAllVirtualFilters?: () => void
}

export function DataTableFilterSummary<TData>({
  table,
  filters,
  virtualFilterValues = {},
  onVirtualFilterChange,
  onClearAllVirtualFilters,
}: DataTableFilterSummaryProps<TData>) {
  const cachedLabels = useFilterLabelStore(state => state.labels)

  const activeFilters = React.useMemo(() => {
    return filters
      .map(filter => {
        const value = virtualFilterValues[filter.columnId]
        if (value === undefined || value === null || value === '') return null

        let displayValue = ''
        if (
          filter.type === 'single-select' ||
          filter.type === 'select' ||
          filter.type === 'faceted' ||
          filter.type === 'autocomplete-select'
        ) {
          if (Array.isArray(value)) {
            displayValue = value
              .map(v => filter.options?.find(o => o.value === v)?.label || cachedLabels[v] || v)
              .join(', ')
          } else {
            const option = filter.options?.find(o => o.value === value)
            displayValue = option ? option.label : cachedLabels[String(value)] || String(value)
          }
        } else if (filter.type === 'boolean') {
          displayValue =
            value === true || value === 'true'
              ? filter.trueLabel || 'Yes'
              : filter.falseLabel || 'No'
        } else if (filter.type === 'date-range') {
          if (typeof value === 'object' && value !== null && 'from' in value && 'to' in value) {
            const dateRange = value as { from: Date; to: Date }
            if (dateRange.from && dateRange.to) {
              const formatDate = (date: Date) => {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
              }
              displayValue = `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
            }
          }
        } else if (filter.type === 'date') {
          if (typeof value === 'string' && value) {
            displayValue = value
          }
        } else {
          displayValue = String(value)
        }

        return {
          id: filter.columnId,
          title: filter.title,
          value: displayValue,
        }
      })
      .filter(Boolean) as { id: string; title: string; value: string }[]
  }, [filters, virtualFilterValues, cachedLabels])

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map(filter => {
        return (
          <div
            key={filter.id}
            className="bg-background border-border/50 group flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-xs"
          >
            <span className="text-muted-foreground">{filter.title}:</span>
            <span>{filter.value}</span>
            <button
              onClick={() => {
                const column = table.getColumn(filter.id)
                if (column) {
                  column.setFilterValue(undefined)
                }
                onVirtualFilterChange?.(filter.id, undefined)
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted -mr-1 ml-0.5 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          table.resetColumnFilters()
          onClearAllVirtualFilters?.()
        }}
        className="h-6 px-2 text-xs text-danger hover:bg-danger-muted hover:text-danger"
      >
        <Trash2 />
        Clear
      </Button>
    </div>
  )
}
