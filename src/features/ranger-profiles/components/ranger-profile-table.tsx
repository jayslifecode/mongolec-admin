'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import { InitialsAvatar, StatusBadge } from '@/components/admin'
import type { RangerProfile } from '../types'
import { DELETE_RANGER_PROFILE } from '@/graphql/mutations/ranger-profiles'

function ActionsCell({
  ranger,
  onDeleteClick,
}: {
  ranger: RangerProfile
  onDeleteClick: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Actions for ${ranger.name}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/ranger-profiles/${ranger.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteClick(ranger.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDeleteClick: (id: string) => void): ColumnDef<RangerProfile>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Ranger',
      cell: ({ row }) => {
        const ranger = row.original
        return (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={ranger.name} src={ranger.photo} size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{ranger.name}</div>
              <div className="text-xs text-muted-foreground truncate">{ranger.parkName}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: 'Order',
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{getValue<number>()}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <StatusBadge tone="success">Active</StatusBadge>
        ) : (
          <StatusBadge>Inactive</StatusBadge>
        ),
    },
    createCreatedAtColumn<RangerProfile>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell ranger={row.original} onDeleteClick={onDeleteClick} />,
    },
  ]
}

interface RangerProfileTableProps {
  rangers: RangerProfile[]
  loading?: boolean
  onActionComplete?: () => void
}

export function RangerProfileTable({ rangers, loading, onActionComplete }: RangerProfileTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [deleteRanger] = useMutation(DELETE_RANGER_PROFILE, {
    onCompleted: () => {
      toast.success('Ranger deleted')
      setDeleteDialogOpen(false)
      setSelectedId(null)
      onActionComplete?.()
    },
    onError: (error) => toast.error(error.message),
  })

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedId) deleteRanger({ variables: { id: selectedId } })
  }

  const sortedRangers = [...rangers].sort((a, b) => a.displayOrder - b.displayOrder)
  const columns = buildColumns(handleDeleteClick)

  return (
    <>
      <DataTable
        data={sortedRangers}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No ranger profiles found."
        toolbarConfig={{ searchPlaceholder: 'Search rangers...' }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ranger</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ranger? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
