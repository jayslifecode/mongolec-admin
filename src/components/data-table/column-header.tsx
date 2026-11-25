import React from 'react'
import { Column } from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
  sortable?: boolean
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  sortable = true,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!sortable) {
    return <div className={cn('flex items-center', className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-transparent"
          >
            {column.getIsSorted() === 'desc' && (
              <ArrowDown className="h-4 w-4" />
            )}
            {column.getIsSorted() === 'asc' && <ArrowUp className="h-4 w-4" />}
            {!column.getIsSorted() && (
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="flex items-center gap-2"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            Sort ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="flex items-center gap-2"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Sort descending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.clearSorting()}
            className="flex items-center gap-2"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Clear sort
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="truncate">{title}</span>
    </div>
  )
}
