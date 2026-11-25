'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2, Pencil, Eye } from 'lucide-react'
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
import type { TeamMember } from '../types'
import { DELETE_TEAM_MEMBER } from '@/graphql/mutations/team'

function ActionsCell({
  member,
  onDeleteClick,
}: {
  member: TeamMember
  onDeleteClick: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Actions for ${member.name}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/team/${member.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/team/${member.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteClick(member.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDeleteClick: (id: string) => void): ColumnDef<TeamMember>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original
        return (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={member.name} src={member.photo} size={40} />
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{member.name}</div>
              <div className="text-xs text-muted-foreground truncate">{member.role}</div>
            </div>
          </div>
        )
      },
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
    createCreatedAtColumn<TeamMember>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell member={row.original} onDeleteClick={onDeleteClick} />,
    },
  ]
}

interface TeamTableProps {
  members: TeamMember[]
  loading?: boolean
  onActionComplete?: () => void
}

export function TeamTable({ members, loading, onActionComplete }: TeamTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [deleteMember] = useMutation(DELETE_TEAM_MEMBER, {
    onCompleted: () => {
      toast.success('Team member deleted')
      setDeleteDialogOpen(false)
      setSelectedId(null)
      onActionComplete?.()
    },
    onError: error => toast.error(error.message),
  })

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedId) deleteMember({ variables: { id: selectedId } })
  }

  const sortedMembers = [...members].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
  const columns = buildColumns(handleDeleteClick)

  return (
    <>
      <DataTable
        data={sortedMembers}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No team members found."
        toolbarConfig={{ searchPlaceholder: 'Search team members...' }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team member? This action cannot be undone.
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
