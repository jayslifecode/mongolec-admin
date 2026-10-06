'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import Link from 'next/link'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, createUpdatedAtColumn } from '@/components/data-table'
import type { ParticipantProfile } from '../types'
import { riderTierConfig } from '../types'
import { DELETE_PARTICIPANT_PROFILE } from '@/graphql/mutations/participant-profiles'

function avatarColor(name: string) {
  const p = [
    'bg-rose-100 text-rose-700',
    'bg-orange-100 text-orange-700',
    'bg-amber-100 text-amber-700',
    'bg-lime-100 text-lime-700',
    'bg-teal-100 text-teal-700',
    'bg-sky-100 text-sky-700',
    'bg-violet-100 text-violet-700',
    'bg-pink-100 text-pink-700',
  ]
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return p[h % p.length]
}

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
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
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
          className="text-red-600"
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
      header: 'Participant',
      cell: ({ row }) => {
        const p = row.original
        const fullName = `${p.firstName} ${p.lastName}`
        const colorClass = avatarColor(fullName)
        const initial = p.firstName[0]?.toUpperCase() ?? '?'
        return (
          <div className="flex items-center gap-3">
            {p.photo ? (
              <img
                src={p.photo}
                alt={fullName}
                className="h-10 w-10 rounded-full object-cover border flex-shrink-0"
              />
            ) : (
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${colorClass}`}
              >
                {initial}
              </div>
            )}
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
      cell: ({ row }) => {
        const p = row.original
        const tierInfo = riderTierConfig[p.tier]
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{p.rallyCount}</span>
            <Badge className={tierInfo.className}>{tierInfo.label}</Badge>
          </div>
        )
      },
    },
    {
      id: 'honoraryTitle',
      header: 'Honorary Title',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.honoraryTitle || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => {
        const active = getValue<boolean>()
        return (
          <Badge variant={active ? 'default' : 'secondary'} className="gap-1">
            <span
              className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-muted-foreground'}`}
            />
            {active ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
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
      toast.success('Participant deleted successfully')
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
        emptyMessage="No participant profiles found."
        toolbarConfig={{ searchPlaceholder: 'Search participants...' }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Participant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this participant? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
