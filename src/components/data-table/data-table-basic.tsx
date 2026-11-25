import React from 'react'
import {
  flexRender,
  Table,
} from '@tanstack/react-table'
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTablePagination } from './pagination'
import { cn } from '@/lib/utils'
import type { DataTableFilterField } from './filter-list'
import type { VirtualFilterValue } from './toolbar'

interface DataTableBasicProps<TData> {
  table: Table<TData>
  actionBar?: React.ReactNode
  loading?: boolean
  /** Shown instead of rows when loading failed (never an empty table that looks like "no data"). */
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  stickyHeader?: boolean
  enablePinning?: boolean
  showPagination?: boolean
  showPageSizeOptions?: boolean
  columnFilter?: boolean
  onRowClick?: (row: TData) => void
  isPending?: boolean
  className?: string
  totalCount?: number
  filters?: DataTableFilterField[]
  virtualFilterValues?: Record<string, VirtualFilterValue>
  onVirtualFilterChange?: (filterId: string, value: VirtualFilterValue) => void
  onClearAllVirtualFilters?: () => void
  children?: React.ReactNode
}

export function getCommonPinningStyles(
  column: {
    getIsPinned: () => 'left' | 'right' | false
    getStart?: (pos: 'left' | 'right') => number
    getSize: () => number
  }
): React.CSSProperties {
  const isPinned = column.getIsPinned()
  return {
    boxShadow: isPinned
      ? `${isPinned === 'left' ? '2px' : isPinned === 'right' ? '-2px' : '0px'} 0px 4px rgba(0, 0, 0, 0.05)`
      : '',
    position: isPinned ? 'sticky' : 'relative',
    backgroundColor: isPinned ? 'var(--background)' : '',
    width: column.getSize(),
    zIndex: isPinned ? 10 : 0,
    ...(isPinned === 'left' && { left: column.getStart?.('left') }),
    ...(isPinned === 'right' && { right: column.getStart?.('right') }),
  }
}

export function DataTableBasic<TData>({
  table,
  actionBar,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No results',
  stickyHeader = true,
  enablePinning = false,
  showPagination = true,
  onRowClick,
  isPending = false,
  className,
  children,
}: DataTableBasicProps<TData>) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-3',
        'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent overflow-auto',
        className
      )}
    >
      {children}

      <div
        className={cn(
          'border-border/50 bg-card overflow-hidden rounded-lg border shadow-sm',
          'relative min-w-full'
        )}
      >
        {isPending && (
          <div
            role="progressbar"
            aria-label="Updating"
            className="bg-primary/60 absolute top-0 right-0 left-0 z-30 h-0.5 animate-pulse"
          />
        )}

        <UITable aria-busy={loading || isPending}>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 z-20')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const pinned = header.column.getIsPinned()
                  return (
                    <TableHead
                      key={header.id}
                      style={enablePinning && mounted ? getCommonPinningStyles(header.column) : undefined}
                      className={cn(
                        'font-semibold',
                        stickyHeader && 'sticky top-0 z-20',
                        pinned && 'bg-muted/50',
                        (header.column.columnDef.meta as { className?: string } | undefined)?.className
                      )}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {error && !loading ? (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  <div role="alert" className="flex flex-col items-center justify-center gap-3 py-8">
                    <p className="text-sm font-medium">Couldn&apos;t load this list</p>
                    <p className="text-muted-foreground max-w-md text-sm">{error}</p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="border-input hover:bg-accent rounded-md border px-3 py-1.5 text-sm font-medium"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : loading ? (
              Array.from({ length: 10 }).map((_, idx) => (
                <TableRow
                  key={`skeleton-${idx}`}
                  aria-hidden="true"
                  className="border-border/30 border-b"
                >
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'group border-border/50 border-b transition-colors',
                    'hover:bg-muted/40 active:bg-muted/60',
                    row.getIsSelected() && 'bg-primary/5 border-primary/20 hover:bg-primary/10',
                    onRowClick && !loading && 'cursor-pointer'
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const cellPinned = cell.column.getIsPinned()
                    return (
                      <TableCell
                        key={cell.id}
                        style={enablePinning && mounted ? getCommonPinningStyles(cell.column) : undefined}
                        className={cn(
                          'relative overflow-hidden align-middle transition-colors',
                          cellPinned && 'bg-background',
                          (cell.column.columnDef.meta as { className?: string } | undefined)?.className
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 py-8">
                    <div className="bg-muted/50 rounded-full p-3">
                      <svg
                        className="text-muted-foreground h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125m0-17.25v17.25m6-17.25v17.25"
                        />
                      </svg>
                    </div>
                    <div className="text-muted-foreground text-sm font-medium">
                      {emptyMessage}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>

      <div className="flex flex-col gap-3">
        {showPagination && <DataTablePagination table={table} />}
        {actionBar && mounted && table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div>{actionBar}</div>
        )}
      </div>
    </div>
  )
}
