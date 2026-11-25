import React from 'react'

import { type Column, type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import { DataTableColumnHeader } from '@/components/data-table/column-header'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

// ─── Kept admin utilities ────────────────────────────────────────────────────

export interface ColumnMetadata {
  filter?: boolean
  filterLabel?: string
  filterPlaceholder?: string
  filterType?:
    | 'input'
    | 'number'
    | 'date'
    | 'date-range'
    | 'select'
    | 'single-select'
    | 'faceted'
    | 'autocomplete-select'
    | 'boolean'
    | 'text'
    | 'multiSelect'
  filterOptions?: Array<{ value: string; label: string }>
  customQuery?: unknown
  virtual?: boolean
  className?: string
}

export function createColumnMeta(meta: ColumnMetadata) {
  return meta
}

export interface PinningColumn {
  getIsPinned: () => 'left' | 'right' | false
  getStart?: (position: 'left' | 'right') => number
  getSize: () => number
}

export function formatDate(date: Date | string | null, fmt: 'short' | 'long' = 'short'): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return fmt === 'short'
    ? d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatTimestamp(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function truncateText(text: string, maxLength = 50): string {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export function formatNumber(num: number | null | undefined): string {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

// ─── Column pinning ──────────────────────────────────────────────────────────

export function getCommonPinningStyles<TData>({
  column,
  withBorder = false,
  customWidth,
}: {
  column: Column<TData>
  withBorder?: boolean
  customWidth?: number
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === 'left' && column.getIsLastColumn('left')
  const isFirstRightPinnedColumn = isPinned === 'right' && column.getIsFirstColumn('right')

  return {
    boxShadow: withBorder
      ? isLastLeftPinnedColumn
        ? '-4px 0 4px -4px var(--border) inset'
        : isFirstRightPinnedColumn
          ? '4px 0 4px -4px var(--border) inset'
          : undefined
      : undefined,
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    opacity: isPinned ? 0.97 : 1,
    position: isPinned ? 'sticky' : 'relative',
    background: 'var(--background)',
    width: customWidth ?? column.getSize(),
    zIndex: isPinned ? 1 : 0,
  }
}

// ─── Status config type ──────────────────────────────────────────────────────

export interface StatusConfig {
  [key: string]: {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    className?: string
    icon?: React.ComponentType<{ className?: string }>
    color?: string
    bgColor?: string
    borderColor?: string
  }
}

// ─── Column factory helpers ───────────────────────────────────────────────────

export const createSelectionColumn = <T>(
  onHeaderChange?: (checked: boolean) => void
): ColumnDef<T> => ({
  id: 'select',
  header: ({ table }) =>
    React.createElement(
      'div',
      { className: 'flex w-full items-center justify-center' },
      React.createElement(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        onCheckedChange: (value: boolean) => {
          table.toggleAllRowsSelected(!!value)
          onHeaderChange?.(!!value)
        },
        'aria-label': 'Select all',
      })
    ),
  cell: ({ row }) =>
    React.createElement(
      'div',
      { className: 'flex w-full items-center justify-center' },
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (value: boolean) => row.toggleSelected(!!value),
        'aria-label': 'Select row',
      })
    ),
  enableSorting: false,
  enableHiding: false,
  meta: {
    className: 'w-10 px-0 text-center sticky start-0 z-10 bg-background [&:is(th)]:bg-muted/50 shadow-[inset_-1px_0_0_0_theme(colors.border)]',
  },
})

export const createTextColumn = <T>(
  accessorKey: string,
  header: string,
  options?: {
    sortable?: boolean
    width?: string
    maxWidth?: string
  }
): ColumnDef<T> => ({
  accessorKey,
  header:
    options?.sortable !== false
      ? ({ column }) =>
          React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
      : header,
  cell: ({ row }) =>
    React.createElement(
      'div',
      {
        className: `truncate ${options?.maxWidth ? `max-w-[${options.maxWidth}]` : 'max-w-32'}`,
      },
      (row.getValue(accessorKey) as string) || '-'
    ),
  enableSorting: options?.sortable !== false,
  meta: {
    className: options?.width ? `w-[${options.width}]` : '',
  },
})

export const createStatusColumn = <T>(
  accessorKey: string,
  header: string,
  statusConfig: StatusConfig,
  options?: {
    filterable?: boolean
    sortable?: boolean
    width?: string
  }
): ColumnDef<T> => ({
  accessorKey,
  header: options?.sortable
    ? ({ column }) =>
        React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
    : header,
  cell: ({ row }) => {
    const status = row.getValue(accessorKey) as string
    const config = statusConfig[status]

    if (!config) {
      return React.createElement('span', { className: 'text-muted-foreground text-xs' }, status)
    }

    return React.createElement(
      'div',
      { className: 'flex items-center gap-1.5' },
      React.createElement(
        Badge,
        {
          variant: config.variant,
          className: `
            ${config.className || ''}
            transition-colors
            cursor-default select-none
            flex items-center gap-1.5
            font-medium text-xs px-2.5 py-1
            border border-current/20
          `.trim(),
        },
        config.icon &&
          React.createElement(config.icon, {
            className: 'h-3 w-3 shrink-0',
          }),
        config.label
      )
    )
  },
  filterFn:
    options?.filterable !== false
      ? (row, id, value) => value.includes(row.getValue(id))
      : undefined,
  enableSorting: options?.sortable === true,
  meta: {
    className: options?.width ? `w-[${options.width}]` : '',
  },
})

export const createEmailColumn = <T>(
  accessorKey: string,
  header = 'Email',
  options?: {
    sortable?: boolean
    width?: string
  }
): ColumnDef<T> => ({
  accessorKey,
  header:
    options?.sortable !== false
      ? ({ column }) =>
          React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
      : header,
  cell: ({ row }) => {
    const email = row.getValue(accessorKey) as string
    return email
      ? React.createElement('a', { href: `mailto:${email}`, className: 'text-primary hover:underline' }, email)
      : React.createElement('span', { className: 'text-muted-foreground' }, '-')
  },
  enableSorting: options?.sortable !== false,
  meta: {
    className: options?.width ? `w-[${options.width}]` : '',
  },
})

export const createDateColumn = <T>(
  accessorKey: string,
  header: string,
  options?: {
    sortable?: boolean
    width?: string
    format?: string
    showTime?: boolean
  }
): ColumnDef<T> => ({
  accessorKey,
  header:
    options?.sortable !== false
      ? ({ column }) =>
          React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
      : header,
  cell: ({ row }) => {
    const date = row.getValue(accessorKey) as Date | string
    if (!date) {
      return React.createElement('span', { className: 'text-muted-foreground' }, '-')
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const formatString = options?.format || (options?.showTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy')
    return React.createElement('span', { className: 'whitespace-nowrap' }, format(dateObj, formatString))
  },
  enableSorting: options?.sortable !== false,
  meta: {
    className: options?.width ? `w-[${options.width}]` : '',
  },
})

export const createNumberColumn = <T>(
  accessorKey: string,
  header: string,
  options?: {
    sortable?: boolean
    width?: string
    format?: 'currency' | 'percentage' | 'number'
    precision?: number
  }
): ColumnDef<T> => ({
  accessorKey,
  header:
    options?.sortable !== false
      ? ({ column }) =>
          React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
      : header,
  cell: ({ row }) => {
    const value = row.getValue(accessorKey) as number
    if (value == null) {
      return React.createElement('span', { className: 'text-muted-foreground' }, '-')
    }
    let formattedValue: string
    switch (options?.format) {
      case 'currency':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: options.precision ?? 2,
        }).format(value)
        break
      case 'percentage':
        formattedValue = new Intl.NumberFormat('en-US', {
          style: 'percent',
          minimumFractionDigits: options.precision ?? 0,
        }).format(value / 100)
        break
      default:
        formattedValue = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: options?.precision ?? 0,
          maximumFractionDigits: options?.precision ?? 2,
        }).format(value)
    }
    return React.createElement('span', { className: 'text-right font-mono' }, formattedValue)
  },
  enableSorting: options?.sortable !== false,
  meta: {
    className: `text-right ${options?.width ? `w-[${options.width}]` : ''}`,
  },
})

export const createBooleanColumn = <T>(
  accessorKey: string,
  header: string,
  options?: {
    sortable?: boolean
    width?: string
    trueLabel?: string
    falseLabel?: string
    showAsIcon?: boolean
  }
): ColumnDef<T> => ({
  accessorKey,
  header:
    options?.sortable !== false
      ? ({ column }) =>
          React.createElement(DataTableColumnHeader<T, unknown>, { column, title: header })
      : header,
  cell: ({ row }) => {
    const value = row.getValue(accessorKey) as boolean
    if (options?.showAsIcon) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center' },
        React.createElement('div', {
          className: `h-2 w-2 rounded-full ${value ? 'bg-success' : 'bg-muted-foreground/40'}`,
        })
      )
    }
    return React.createElement(
      Badge,
      { variant: value ? 'default' : 'secondary', className: 'font-mono' },
      value ? (options?.trueLabel ?? 'Yes') : (options?.falseLabel ?? 'No')
    )
  },
  enableSorting: options?.sortable !== false,
  filterFn: (row, id, value) => {
    const rowValue = row.getValue(id) as boolean
    return value.includes(rowValue.toString())
  },
  meta: {
    className: options?.width ? `w-[${options.width}]` : '',
  },
})

export const createCreatedAtColumn = <T>(options?: {
  title?: string
  filter?: boolean
  filterType?: 'number' | 'text' | 'select' | 'multiSelect' | 'date' | 'boolean'
}): ColumnDef<T> => ({
  accessorKey: 'createdAt',
  header: ({ column }) =>
    React.createElement(DataTableColumnHeader<T, unknown>, {
      column,
      title: options?.title || 'Created',
    }),
  cell: ({ row }) => {
    const date = row.getValue('createdAt') as Date | string | null | undefined
    if (!date) return React.createElement('span', { className: 'text-muted-foreground' }, '-')
    const d = typeof date === 'string' ? new Date(date) : date
    return React.createElement(
      'div',
      { className: 'text-sm' },
      React.createElement('div', { className: 'font-medium' }, format(d, 'MMM dd, yyyy')),
      React.createElement('div', { className: 'text-muted-foreground font-mono' }, format(d, 'HH:mm'))
    )
  },
  enableSorting: true,
  meta: {
    className: 'w-[140px]',
    filter: options?.filter,
    filterType: options?.filterType || 'date',
    title: options?.title || 'Created',
  },
})

export const createUpdatedAtColumn = <T>(options?: {
  title?: string
  filter?: boolean
  filterType?: 'number' | 'text' | 'select' | 'multiSelect' | 'date' | 'boolean'
}): ColumnDef<T> => ({
  accessorKey: 'updatedAt',
  header: ({ column }) =>
    React.createElement(DataTableColumnHeader<T, unknown>, { column, title: options?.title || 'Updated' }),
  cell: ({ row }) => {
    const date = row.getValue('updatedAt') as Date | string | null | undefined
    if (!date) return React.createElement('span', { className: 'text-muted-foreground' }, '-')
    const d = typeof date === 'string' ? new Date(date) : date
    return React.createElement(
      'div',
      { className: 'text-sm' },
      React.createElement('div', { className: 'font-medium' }, format(d, 'MMM dd, yyyy')),
      React.createElement('div', { className: 'text-muted-foreground font-mono' }, format(d, 'HH:mm'))
    )
  },
  enableSorting: true,
  meta: {
    className: 'w-[140px]',
    filter: options?.filter,
    filterType: options?.filterType || 'date',
    title: options?.title || 'Updated',
  },
})

export const createActionsColumn = <T>(
  actions: React.ComponentType<{ row: { original: T } }>,
  options?: {
    width?: string
    sticky?: boolean
  }
): ColumnDef<T> => ({
  id: 'actions',
  header: () =>
    React.createElement(
      'div',
      { className: 'flex items-center justify-center w-full h-full' },
      React.createElement('span', { className: 'font-medium' }, 'Actions')
    ),
  cell: ({ row }) =>
    React.createElement(
      'div',
      { className: 'flex items-center justify-center w-full h-full' },
      React.createElement(actions, { row })
    ),
  enableSorting: false,
  enableHiding: true,
  meta: {
    className: `${options?.width ? `w-[${options.width}]` : 'w-[60px]'} ${
      (options?.sticky ?? true)
        ? 'px-0 text-center sticky end-0 z-10 [&:is(th)]:z-30 shadow-[inset_1px_0_0_0_theme(colors.border)] [&:is(th)]:bg-muted [&:is(td)]:bg-background'
        : ''
    }`,
  },
})
