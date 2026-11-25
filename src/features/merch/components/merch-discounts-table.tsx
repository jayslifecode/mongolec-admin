'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/admin'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import { DELETE_MERCH_DISCOUNT } from '@/graphql/mutations/merch'
import { GET_MERCH_DISCOUNTS } from '@/graphql/queries/merch'
import type { MerchDiscount } from '../types'

function ActionsCell({
  discount,
  onDelete,
}: {
  discount: MerchDiscount
  onDelete: (discount: MerchDiscount) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${discount.name}`}>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/merch/discounts/${discount.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(discount)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDelete: (discount: MerchDiscount) => void): ColumnDef<MerchDiscount>[] {
  return [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ getValue }) => {
      const type = getValue<string>()
      return (
        <StatusBadge>{type === 'PERCENT' ? 'Percent' : 'Amount'}</StatusBadge>
      )
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
      const { type, value } = row.original
      return (
        <span className="font-mono text-sm">
          {type === 'PERCENT' ? `${value}%` : `₮${value.toLocaleString()}`}
        </span>
      )
    },
  },
  {
    id: 'dateRange',
    header: 'Date Range',
    cell: ({ row }) => {
      const { startDate, endDate } = row.original
      const fmt = (d: string) => {
        try { return format(new Date(d), 'MMM d, yyyy') } catch { return d }
      }
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {fmt(startDate)} – {fmt(endDate)}
        </span>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ getValue }) => (
      <StatusBadge tone={getValue<boolean>() ? 'success' : 'neutral'}>
        {getValue<boolean>() ? 'Active' : 'Inactive'}
      </StatusBadge>
    ),
  },
  {
    id: 'productCount',
    header: 'Products',
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.productIds?.length ?? 0}</Badge>
    ),
  },
  createCreatedAtColumn<MerchDiscount>(),
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell discount={row.original} onDelete={onDelete} />,
  },
  ]
}

interface MerchDiscountsTableProps {
  discounts?: MerchDiscount[]
  loading?: boolean
}

export function MerchDiscountsTable({ discounts = [], loading }: MerchDiscountsTableProps) {
  const [discountToDelete, setDiscountToDelete] = useState<MerchDiscount | null>(null)
  const [deleteDiscount, { loading: isDeleting }] = useMutation(DELETE_MERCH_DISCOUNT, {
    refetchQueries: [{ query: GET_MERCH_DISCOUNTS, variables: { limit: 100, offset: 0 } }],
  })

  const handleConfirmDelete = async () => {
    if (!discountToDelete) return
    try {
      await deleteDiscount({ variables: { id: discountToDelete.id } })
      toast.success('Discount deleted successfully')
      setDiscountToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete discount')
    }
  }

  return (
    <>
      <DataTable
        data={discounts}
        columns={buildColumns(setDiscountToDelete)}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No discounts found."
        toolbarConfig={{ searchPlaceholder: 'Search discounts…' }}
      />
      <ConfirmDialog
        open={!!discountToDelete}
        onOpenChange={(open) => !open && setDiscountToDelete(null)}
        title="Delete this discount?"
        description={`"${discountToDelete?.name ?? ''}" will be permanently deleted. This cannot be undone.`}
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
