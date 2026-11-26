'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trophy, Calendar, Edit, Trash2, Check, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
import { QueryError } from './query-error'
import type { Rally } from '../types'
import { rallyStatusConfig } from '../types'
import { CHANGE_RALLY_STATUS, TOGGLE_RALLY_RECRUITING, DELETE_RALLY } from '@/graphql/mutations/rallies'

function getDisplayName(field: string | { en: string; mn: string } | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ActionsCell({
  rally,
  onDeleteClick,
  onStatusChange,
}: {
  rally: Rally
  onDeleteClick: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${getDisplayName(rally.title) || 'rally'}`}>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/rallies/${rally.id}`}>
            <Trophy className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/rallies/${rally.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Set status</DropdownMenuLabel>
        {Object.entries(rallyStatusConfig).map(([key, config]) => (
          <DropdownMenuItem
            key={key}
            disabled={key === rally.status}
            onClick={() => onStatusChange(rally.id, key)}
          >
            {key === rally.status ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <span className="mr-2 h-4 w-4" />}
            {config.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDeleteClick(rally.id)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(
  onDeleteClick: (id: string) => void,
  onStatusChange: (id: string, status: string) => void,
  onToggleRecruiting: (rally: Rally) => void
): ColumnDef<Rally>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Rally',
      cell: ({ row }) => {
        const rally = row.original
        const title = getDisplayName(rally.title)
        const dateRange = `${formatDate(rally.startDate)} – ${formatDate(rally.endDate)}`
        return (
          <div className="flex items-center gap-3">
            {rally.heroImage ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-muted flex-shrink-0">
                <Image
                  src={rally.heroImage}
                  alt={title || 'Rally'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border flex-shrink-0">
                <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate text-sm">
                  {title || <span className="text-muted-foreground italic">Untitled Rally</span>}
                </span>
                {rally.isFeatured && (
                  <StatusBadge tone="primary" className="flex-shrink-0 px-1.5 py-0">
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    Featured
                  </StatusBadge>
                )}
              </div>
              {rally.slug && (
                <div className="text-xs text-muted-foreground font-mono">{rally.slug}</div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{dateRange}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const config = rallyStatusConfig[row.original.status]
        return <StatusBadge tone={config?.tone ?? 'neutral'}>{config?.label ?? row.original.status}</StatusBadge>
      },
    },
    {
      accessorKey: 'currentParticipants',
      header: 'Participants',
      cell: ({ row }) => {
        const rally = row.original
        const count = rally.currentParticipants || 0
        const max = rally.maxParticipants
        const hasLimit = typeof max === 'number' && max > 0
        const isFull = hasLimit && count >= max
        const pct = hasLimit ? Math.min((count / max) * 100, 100) : 0
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">{count}</span>
              {hasLimit && <span className="text-muted-foreground">/ {max}</span>}
              {isFull && <StatusBadge className="ml-1 px-1.5 py-0">Full</StatusBadge>}
            </div>
            {hasLimit && (
              <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'isRecruiting',
      header: 'Recruiting',
      cell: ({ row }) => {
        const rally = row.original
        const title = getDisplayName(rally.title) || 'rally'
        return (
          <button
            type="button"
            onClick={() => onToggleRecruiting(rally)}
            aria-label={`${rally.isRecruiting ? 'Close' : 'Open'} applications for ${title}. Currently ${rally.isRecruiting ? 'open' : 'closed'}.`}
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
          >
            <span
              aria-hidden="true"
              className={rally.isRecruiting ? 'h-2 w-2 flex-shrink-0 rounded-full bg-success' : 'h-2 w-2 flex-shrink-0 rounded-full bg-muted-foreground/40'}
            />
            <span className={rally.isRecruiting ? 'text-success' : 'text-muted-foreground'}>
              {rally.isRecruiting ? 'Open' : 'Closed'}
            </span>
          </button>
        )
      },
    },
    createCreatedAtColumn<Rally>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell rally={row.original} onDeleteClick={onDeleteClick} onStatusChange={onStatusChange} />,
    },
  ]
}

interface RalliesTableProps {
  rallies: Rally[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

export function RalliesTable({ rallies, loading, error, onRetry }: RalliesTableProps) {
  const router = useRouter()
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null)
  const [recruitingTarget, setRecruitingTarget] = useState<Rally | null>(null)

  const [updateStatus] = useMutation(CHANGE_RALLY_STATUS, {
    onCompleted: () => {
      toast.success('Rally status updated successfully')
      router.refresh()
    },
    onError: error => toast.error(error.message),
  })

  const [toggleRecruiting] = useMutation(TOGGLE_RALLY_RECRUITING, {
    onCompleted: () => {
      toast.success('Recruiting status updated')
      router.refresh()
    },
    onError: error => toast.error(error.message),
  })

  const [deleteRally] = useMutation(DELETE_RALLY, {
    onCompleted: () => {
      toast.success('Rally deleted successfully')
      setDeleteDialogId(null)
      router.refresh()
    },
    onError: error => {
      toast.error(error.message)
      setDeleteDialogId(null)
    },
  })

  const handleStatusChange = (id: string, status: string) => {
    updateStatus({ variables: { id, status }, refetchQueries: ['GetRallies'] })
  }

  const confirmToggleRecruiting = () => {
    if (recruitingTarget) {
      toggleRecruiting({ variables: { id: recruitingTarget.id }, refetchQueries: ['GetRallies'] })
    }
    setRecruitingTarget(null)
  }

  const handleDeleteClick = (id: string) => setDeleteDialogId(id)

  const confirmDelete = () => {
    if (deleteDialogId) deleteRally({ variables: { id: deleteDialogId }, refetchQueries: ['GetRallies'] })
  }

  const columns = buildColumns(handleDeleteClick, handleStatusChange, setRecruitingTarget)

  if (error) return <QueryError title="Could not load rallies" message={error} onRetry={onRetry} />

  return (
    <>
      <DataTable
        data={rallies}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        enableRowSelection
        emptyMessage="No rallies found."
        toolbarConfig={{ searchPlaceholder: 'Search rallies...' }}
      />

      <AlertDialog open={!!recruitingTarget} onOpenChange={(open) => !open && setRecruitingTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {recruitingTarget?.isRecruiting ? 'Close applications?' : 'Open applications?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {recruitingTarget?.isRecruiting
                ? 'Visitors will no longer be able to apply for this rally.'
                : 'Visitors will be able to apply for this rally on the public site.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleRecruiting}>
              {recruitingTarget?.isRecruiting ? 'Close applications' : 'Open applications'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rally</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The rally and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
