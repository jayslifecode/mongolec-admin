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
import { DataTable, createUpdatedAtColumn } from '@/components/data-table'
import { InitialsAvatar, StatusBadge } from '@/components/admin'
import type { ParticipantProfile } from '../types'
import { DELETE_PARTICIPANT_PROFILE } from '@/graphql/mutations/participant-profiles'

function ActionsCell({
  participant,
  onDeleteClick,
}: {
  participant: ParticipantProfile
  onDeleteClick: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Actions for ${participant.firstName} ${participant.lastName}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/participant-profiles/${participant.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDeleteClick(participant.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(
  onDeleteClick: (id: string) => void,
): ColumnDef<ParticipantProfile>[] {
  return [
    {
      id: 'fullName',
      header: 'Rider',
      cell: ({ row }) => {
        const p = row.original
        const fullName = `${p.firstName} ${p.lastName}`
        return (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={fullName} src={p.photo} size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{fullName}</div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'country',
      header: 'Country',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.country}</span>
      ),
    },
    {
      id: 'rallies',
      header: 'Rallies',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm tabular-nums">{row.original.rallyCount}</span>
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
    createUpdatedAtColumn<ParticipantProfile>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell participant={row.original} onDeleteClick={onDeleteClick} />
      ),
    },
  ]
}

interface ParticipantProfileTableProps {
  participants: ParticipantProfile[]
  loading?: boolean
  onActionComplete?: () => void
}

export function ParticipantProfileTable({
  participants,
  loading,
  onActionComplete,
}: ParticipantProfileTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [deleteParticipant] = useMutation(DELETE_PARTICIPANT_PROFILE, {
    onCompleted: () => {
      toast.success('Rider deleted')
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
    if (selectedId) deleteParticipant({ variables: { id: selectedId } })
  }

  const sortedParticipants = [...participants].sort((a, b) => a.displayOrder - b.displayOrder)
  const columns = buildColumns(handleDeleteClick)

  return (
    <>
      <DataTable
        data={sortedParticipants}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No riders found."
        toolbarConfig={{ searchPlaceholder: 'Search riders...' }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete rider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rider? This action cannot be undone.
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
