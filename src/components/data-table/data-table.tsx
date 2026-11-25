'use client'

import React from 'react'

import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type Updater,
} from '@tanstack/react-table'

import { useDataTable } from '@/hooks/use-data-table'
import { createSelectionColumn } from './column-helpers'

import { BulkActionBar } from './bulk-action-bar'
import { BulkSelectionCount } from './bulk-selection-count'
import { DataTableBasic } from './data-table-basic'
import { type DataTableFilterField } from './filter-list'
import { DataTableToolbar, type VirtualFilterValue } from './toolbar'

interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]

  searchValue?: string
  onSearchChange?: (value: string) => void
  pagination?: PaginationState
  onPaginationChange?: (updater: Updater<PaginationState>) => void
  sorting?: SortingState
  onSortingChange?: (updater: Updater<SortingState>) => void
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>

  totalCount?: number

  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
  pageCount?: number

  loading?: boolean
  /** Query error message: shown with "Try again" instead of an empty table. */
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  stickyHeader?: boolean

  enablePinning?: boolean
  showPagination?: boolean
  showPageSizeOptions?: boolean

  filterTop?: boolean

  enableColumnResizing?: boolean
  tableId?: string

  showIndexColumn?: boolean
  indexColumnHeader?: string

  enableRowSelection?: boolean
  bulkActions?: React.ReactNode
  onRowClick?: (row: TData) => void
  onRowSelectionChange?: (selectedRows: TData[]) => void

  isPending?: boolean

  toolbar?: React.ReactNode
  toolbarConfig?: {
    searchPlaceholder?: string
    enableView?: boolean
    enableFilter?: boolean
    customButton?: boolean
    customClick?: () => void
    enableExport?: boolean
    onExport?: () => void
    onCustomSearch?: (value: string) => void
    currentSearchValue?: string
    filters?: Array<{
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
      placeholder?: string
      icon?: React.ComponentType<{ className?: string }>
      multiple?: boolean
      customQuery?:
        | import('./autocomplete-select-filter').CustomQueryConfig
        | import('./autocomplete-select-filter').TypedCustomQueryConfig
      startDateKey?: string
      endDateKey?: string
      options?: {
        label: string
        value: string
        icon?: React.ComponentType<{ className?: string }>
      }[]
      hideOnPaths?: string[]
      maxDate?: Date | 'today'
      minDate?: Date | 'today'
      dependsOn?: string[]
    }>
    virtualFilterValues?: Record<string, VirtualFilterValue>
    onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
    onClearAllVirtualFilters?: () => void
    labels?: {
      filters?: string
      filter?: string
      export?: string
      view?: string
    }
  }
  children?: React.ReactNode
  className?: string
}

export function DataTable<TData>({
  data,
  columns,
  searchValue,
  onSearchChange,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  manualPagination = false,
  manualSorting = true,
  manualFiltering = false,
  pageCount = -1,
  loading = false,
  error = null,
  onRetry,
  emptyMessage,
  stickyHeader = true,
  enablePinning = false,
  showPagination = true,
  showPageSizeOptions: showPageSizeOptionsProp,
  showIndexColumn = true,
  indexColumnHeader = '№',
  enableRowSelection = false,
  bulkActions,
  onRowClick,
  isPending,
  toolbar,
  toolbarConfig,
  children,
  className,
  totalCount,
  filterTop = false,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const enhancedColumns = React.useMemo(() => {
    let finalColumns: ColumnDef<TData>[] = columns.map(col => {
      if (col.id === 'actions') {
        const existingMeta = (col.meta as { className?: string } | undefined) ?? {}
        if (!existingMeta.className?.includes('sticky')) {
          return {
            ...col,
            meta: {
              ...existingMeta,
              className: `px-0 text-center sticky end-0 z-10 bg-background [&:is(th)]:bg-muted/50 shadow-[inset_1px_0_0_0_theme(colors.border)] ${existingMeta.className ?? ''}`.trim(),
            },
          }
        }
      }
      return col
    })

    const hasSelectionColumn = finalColumns.some(col => col.id === 'select')
    if (enableRowSelection && !hasSelectionColumn) {
      finalColumns = [createSelectionColumn<TData>(), ...finalColumns]
    }

    if (showIndexColumn) {
      const indexColumn: ColumnDef<TData> = {
        id: 'index',
        header: () => (
          <div className="flex items-center justify-center">
            <span>{indexColumnHeader}</span>
          </div>
        ),
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex
          const pageSize = table.getState().pagination.pageSize
          return pageIndex * pageSize + row.index + 1
        },
        meta: {
          className:
            'text-center w-10 sticky start-0 z-10 shadow-[inset_-1px_0_0_0_theme(colors.border)] [&:is(th)]:bg-muted [&:is(td)]:bg-background [[data-state=selected]_&]:bg-muted',
        },
        enableSorting: false,
        enableHiding: false,
      }

      const selectionColumnIndex = finalColumns.findIndex(col => col.id === 'select')
      if (selectionColumnIndex >= 0) {
        finalColumns = [
          ...finalColumns.slice(0, selectionColumnIndex + 1),
          indexColumn,
          ...finalColumns.slice(selectionColumnIndex + 1),
        ]
      } else {
        finalColumns = [indexColumn, ...finalColumns]
      }
    }

    return finalColumns
  }, [columns, showIndexColumn, indexColumnHeader, enableRowSelection])

  const computedFilters = React.useMemo(() => {
    const autoFilters = columns
      .map(col => {
        const meta = col.meta as
          | {
              filter?: boolean
              filterType?: string
              filterOptions?: { label: string; value: string }[]
              title?: string
              filterConfig?: Partial<DataTableFilterField>
            }
          | undefined

        if (meta?.filter) {
          const columnId = col.id ?? (col as { accessorKey?: string }).accessorKey
          if (!columnId) return null

          if (meta.filterConfig) {
            return {
              columnId: meta.filterConfig.columnId || columnId,
              title:
                meta.filterConfig.title ||
                meta.title ||
                (typeof col.header === 'string' ? col.header : columnId),
              ...meta.filterConfig,
            }
          }

          return {
            columnId,
            title: meta.title || (typeof col.header === 'string' ? col.header : columnId),
            type:
              meta.filterType === 'text'
                ? 'input'
                : meta.filterType === 'multiSelect'
                  ? 'faceted'
                  : meta.filterType === 'select'
                    ? 'single-select'
                    : (meta.filterType as DataTableFilterField['type']),
            options: meta.filterOptions,
          }
        }
        return null
      })
      .filter(Boolean) as DataTableFilterField[]

    return [...(toolbarConfig?.filters || []), ...autoFilters]
  }, [columns, toolbarConfig?.filters])

  const {
    table,
    hasSelection,
    searchValue: currentSearchValue,
    onSearchChange: handleSearchChange,
    selectedRows,
  } = useDataTable({
    data,
    columns: enhancedColumns,
    searchValue,
    onSearchChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount,
    enableRowSelection,
    enableColumnPinning: enablePinning,
  })

  const previousSelection = React.useRef<string>('')

  React.useEffect(() => {
    if (!onRowSelectionChange) return
    const currentSelection = JSON.stringify(selectedRows)
    if (currentSelection !== previousSelection.current) {
      previousSelection.current = currentSelection
      onRowSelectionChange(selectedRows)
    }
  }, [selectedRows, onRowSelectionChange])

  const actionBar = React.useMemo(() => {
    if (!enableRowSelection || !hasSelection) return null
    return (
      <BulkActionBar isOpen={hasSelection} onClose={() => table.resetRowSelection()}>
        <BulkSelectionCount
          selectedRowsCount={table.getSelectedRowModel().rows.length}
          onClear={() => table.resetRowSelection()}
        />
        {bulkActions}
      </BulkActionBar>
    )
  }, [table, hasSelection, enableRowSelection, bulkActions])

  const enhancedToolbar = React.useMemo(() => {
    if (toolbar) return toolbar
    if (!toolbarConfig) return null
    return (
      <DataTableToolbar
        table={table}
        searchPlaceholder={toolbarConfig.searchPlaceholder}
        enableView={toolbarConfig.enableView}
        enableFilter={toolbarConfig.enableFilter}
        filters={toolbarConfig.filters}
        searchValue={currentSearchValue}
        onSearchChange={handleSearchChange}
        virtualFilterValues={toolbarConfig.virtualFilterValues}
        onVirtualFilterChange={toolbarConfig.onVirtualFilterChange}
        onClearAllVirtualFilters={toolbarConfig.onClearAllVirtualFilters}
      />
    )
  }, [table, toolbar, toolbarConfig, currentSearchValue, handleSearchChange])

  return (
    <div className="space-y-4">
      {enhancedToolbar}
      <DataTableBasic
        table={table}
        actionBar={actionBar}
        loading={loading || isPending}
        error={error}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
        stickyHeader={stickyHeader}
        enablePinning={enablePinning}
        showPagination={showPagination}
        showPageSizeOptions={
          showPageSizeOptionsProp ?? (manualPagination ? !!onPaginationChange : true)
        }
        onRowClick={onRowClick}
        isPending={isPending}
        className={className}
        totalCount={totalCount}
        filters={toolbarConfig?.filters || computedFilters}
        virtualFilterValues={toolbarConfig?.virtualFilterValues}
        onVirtualFilterChange={toolbarConfig?.onVirtualFilterChange}
        onClearAllVirtualFilters={toolbarConfig?.onClearAllVirtualFilters}
      >
        {children}
      </DataTableBasic>
    </div>
  )
}

export { useDataTable } from '@/hooks/use-data-table'
export * from './column-helpers'
