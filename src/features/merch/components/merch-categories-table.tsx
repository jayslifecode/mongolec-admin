'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'

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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DELETE_MERCH_CATEGORY } from '@/graphql/mutations/merch'
import type { MerchCategory } from '../types'

type CategoryRow = Pick<MerchCategory, 'id' | 'name' | 'slug' | 'createdAt'> & { description?: string | null }

function ActionsCell({ category, onDelete }: { category: CategoryRow; onDelete: (c: CategoryRow) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${category.name}`}>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/merch/categories/${category.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(category)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDelete: (c: CategoryRow) => void): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => <span className="font-mono text-sm text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="max-w-[300px] truncate block">{getValue<string>() || '—'}</span>,
    },
    createCreatedAtColumn<CategoryRow>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell category={row.original} onDelete={onDelete} />,
    },
  ]
}

interface MerchCategoriesTableProps {
  categories: CategoryRow[]
  loading?: boolean
}

export function MerchCategoriesTable({ categories, loading }: MerchCategoriesTableProps) {
  const [toDelete, setToDelete] = useState<CategoryRow | null>(null)
  const [deleteCategory, { loading: isDeleting }] = useMutation(DELETE_MERCH_CATEGORY, {
    refetchQueries: ['GetMerchCategories'],
  })

  const handleConfirm = async () => {
    if (!toDelete) return
    try {
      await deleteCategory({ variables: { id: toDelete.id } })
      toast.success('Category deleted')
      setToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category')
    }
  }

  return (
    <>
      <DataTable
        data={categories}
        columns={buildColumns(setToDelete)}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No categories yet."
        toolbarConfig={{ searchPlaceholder: 'Search categories…' }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this category?"
        description={`"${toDelete?.name ?? ''}" will be permanently deleted. Products in it will no longer have a category.`}
        isPending={isDeleting}
        onConfirm={handleConfirm}
      />
    </>
  )
}
