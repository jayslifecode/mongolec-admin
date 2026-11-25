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
import { DELETE_NEWS_CATEGORY } from '@/graphql/mutations/news'

export interface NewsCategoryRow {
  id: string
  name: string
  slug: string
  color?: string | null
  description?: string | null
  createdAt: string
}

function ActionsCell({ category, onDelete }: { category: NewsCategoryRow; onDelete: (c: NewsCategoryRow) => void }) {
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
          <Link href={`/news/categories/${category.id}/edit`}>
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

function buildColumns(onDelete: (c: NewsCategoryRow) => void): ColumnDef<NewsCategoryRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-2 font-medium">
          {/* The colour is data chosen by the editor, shown as a swatch next to the name. */}
          <span
            aria-hidden="true"
            className="h-3 w-3 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: row.original.color || undefined }}
          />
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ getValue }) => <span className="font-mono text-sm text-muted-foreground">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => <span className="max-w-[300px] truncate block">{getValue<string | null>() || '—'}</span>,
    },
    createCreatedAtColumn<NewsCategoryRow>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell category={row.original} onDelete={onDelete} />,
    },
  ]
}

interface NewsCategoriesTableProps {
  categories: NewsCategoryRow[]
  loading?: boolean
}

export function NewsCategoriesTable({ categories, loading }: NewsCategoriesTableProps) {
  const [toDelete, setToDelete] = useState<NewsCategoryRow | null>(null)
  const [deleteCategory, { loading: isDeleting }] = useMutation(DELETE_NEWS_CATEGORY, {
    refetchQueries: ['GetNewsCategories'],
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
        description={`"${toDelete?.name ?? ''}" will be permanently deleted. Articles in it will no longer have a category.`}
        isPending={isDeleting}
        onConfirm={handleConfirm}
      />
    </>
  )
}
