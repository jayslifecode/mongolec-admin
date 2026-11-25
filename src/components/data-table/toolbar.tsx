'use client'

import React, { useRef, useCallback } from 'react'
import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SimpleFilter } from './simple-filter'
import { DataTableViewOptions } from './view-options'
import { X, Search } from 'lucide-react'
import type { DataTableFilterField } from './filter-list'

export type VirtualFilterValue =
  | string
  | string[]
  | boolean
  | number
  | { from: Date; to: Date }
  | null
  | undefined

export type { DataTableFilterField }

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  filters?: DataTableFilterField[]
  searchValue?: string
  onSearchChange?: (value: string) => void
  customButton?: React.ReactNode
  enableView?: boolean
  enableFilter?: boolean
  filterTop?: boolean
  virtualFilterValues?: Record<string, VirtualFilterValue>
  onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
  onClearAllVirtualFilters?: () => void
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Search...',
  filters = [],
  searchValue = '',
  onSearchChange,
  customButton,
  enableView = true,
  enableFilter = true,
}: DataTableToolbarProps<TData>) {
  const searchTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const activeFiltersCount = filters.filter(
    (f) => table.getColumn(f.columnId)?.getFilterValue?.()
  ).length

  const handleSearchChange = useCallback(
    (value: string) => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current)
      }

      searchTimerRef.current = setTimeout(() => {
        onSearchChange?.(value)
      }, 300)
    },
    [onSearchChange]
  )

  const handleClearAllFilters = useCallback(() => {
    filters.forEach((filter) => {
      const column = table.getColumn(filter.columnId)
      if (column) {
        column.setFilterValue(undefined)
      }
    })
    onSearchChange?.('')
  }, [filters, table, onSearchChange])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label={searchPlaceholder || 'Search'}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 w-full sm:max-w-xs"
          />
        </div>
        <div className="flex items-center space-x-2">
          {customButton}
          {enableView && <DataTableViewOptions table={table} />}
        </div>
      </div>

      {enableFilter && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <SimpleFilter<TData>
              key={filter.columnId}
              filter={filter}
              table={table}
            />
          ))}

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearAllFilters}
              className="h-8 px-2 lg:px-3"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}

          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {activeFiltersCount} active filter
              {activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
