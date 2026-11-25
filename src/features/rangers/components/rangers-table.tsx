'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, MapPin, Shield, Eye, Pencil, Trash2 } from 'lucide-react'
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
import { StatusBadge } from '@/components/admin'
import type { ParkPartnership } from '../types'
import { partnershipStatusConfig } from '../types'
import { DELETE_PARK_PARTNERSHIP, CHANGE_PARTNERSHIP_STATUS } from '@/graphql/mutations/rangers'

function getDisplayName(field: string | { en: string; mn: string } | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}


function ActionsCell({
  ranger,
  onDeleteClick,
  onStatusChange,
}: {
  ranger: ParkPartnership
  onDeleteClick: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Actions for ${getDisplayName(ranger.parkName)}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/rangers/${ranger.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/rangers/${ranger.id}/edit`}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
        {Object.entries(partnershipStatusConfig).map(([key, config]) => (
          <DropdownMenuItem key={key} onClick={() => onStatusChange(ranger.id, key)}>
            {config.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDeleteClick(ranger.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(
  onDeleteClick: (id: string) => void,
  onStatusChange: (id: string, status: string) => void
): ColumnDef<ParkPartnership>[] {
  return [
    {
      accessorKey: 'parkName',
      header: 'Park partner',
      cell: ({ row }) => {
        const ranger = row.original
        const partnershipTypeLabel = getDisplayName(ranger.partnershipType)
        const subtextParts = [ranger.country, partnershipTypeLabel].filter(Boolean)
        return (
          <div className="flex items-center gap-3">
            <div className="border-border bg-muted flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border">
              <MapPin className="text-muted-foreground h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-sm">
                {getDisplayName(ranger.parkName)}
              </div>
              {subtextParts.length > 0 && (
                <div className="text-xs text-muted-foreground truncate">
                  {subtextParts.join(' · ')}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'rangersCount',
      header: 'Rangers',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Shield className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium">{getValue<number>() || 0}</span>
          <span className="text-muted-foreground">rangers</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>()
        const conf = partnershipStatusConfig[status as keyof typeof partnershipStatusConfig]
        return <StatusBadge tone={conf.tone}>{conf.label}</StatusBadge>
      },
    },
    createCreatedAtColumn<ParkPartnership>({ title: 'Since' }),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell
          ranger={row.original}
          onDeleteClick={onDeleteClick}
          onStatusChange={onStatusChange}
        />
      ),
    },
  ]
}

interface RangersTableProps {
  rangers: ParkPartnership[]
  loading?: boolean
  onActionComplete?: () => void
}

export function RangersTable({ rangers, loading, onActionComplete }: RangersTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [deletePartnership] = useMutation(DELETE_PARK_PARTNERSHIP, {
    onCompleted: () => {
      toast.success('Park partner deleted')
      setDeleteDialogOpen(false)
      setSelectedId(null)
      onActionComplete?.()
    },
    onError: error => toast.error(error.message),
  })

  const [updateStatus] = useMutation(CHANGE_PARTNERSHIP_STATUS, {
    onCompleted: () => {
      toast.success('Status updated')
      onActionComplete?.()
    },
    onError: error => toast.error(error.message),
  })

  const handleDeleteClick = (id: string) => {
    setSelectedId(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedId) deletePartnership({ variables: { id: selectedId } })
  }

  const handleStatusChange = (id: string, status: string) => {
    updateStatus({ variables: { id, status } })
  }

  const columns = buildColumns(handleDeleteClick, handleStatusChange)

  return (
    <>
      <DataTable
        data={rangers}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No park partners found."
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete park partner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this park partner? This action cannot be undone.
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
