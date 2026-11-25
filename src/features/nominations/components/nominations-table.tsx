'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MapPin,
  Building2,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'

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
import { StatusBadge } from '@/components/admin'
import { QueryError } from '@/features/rallies/components/query-error'
import type { Nomination } from '../types'
import { nominationStatusConfig } from '../types'
import { ApproveDialog, RejectDialog } from './nomination-actions'

type DialogAction = 'approve' | 'reject' | null


function getDisplayName(field: string | { en: string; mn: string } | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

function ActionsCell({
  nomination,
  onActionComplete,
}: {
  nomination: Nomination
  onActionComplete?: () => void
}) {
  const [dialog, setDialog] = useState<DialogAction>(null)

  const closeDialog = () => setDialog(null)
  const handleComplete = () => {
    closeDialog()
    onActionComplete?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={`Actions for ${getDisplayName(nomination.parkNames) || 'nomination'}`}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/nominations/${nomination.id}`} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          {(nomination.status === 'PENDING' || nomination.status === 'UNDER_REVIEW') && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDialog('approve')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDialog('reject')}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveDialog
        open={dialog === 'approve'}
        onOpenChange={(o) => !o && closeDialog()}
        nominationId={nomination.id}
        onActionComplete={handleComplete}
      />
      <RejectDialog
        open={dialog === 'reject'}
        onOpenChange={(o) => !o && closeDialog()}
        nominationId={nomination.id}
        onActionComplete={handleComplete}
      />
    </>
  )
}

function buildColumns(onActionComplete?: () => void): ColumnDef<Nomination>[] {
  return [
    {
      accessorKey: 'parkNames',
      header: 'Park',
      cell: ({ row }) => {
        const nomination = row.original
        const website = nomination.parkWebsites ? getDisplayName(nomination.parkWebsites) : null
        const subtextParts = [nomination.country, website].filter(Boolean)
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate max-w-[180px]">
                {getDisplayName(nomination.parkNames)}
              </div>
              {subtextParts.length > 0 && (
                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {subtextParts.join(' • ')}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'partnerOrganizationName',
      header: 'Organization',
      cell: ({ getValue }) => {
        const name = getValue<string>()
        return (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm truncate max-w-[150px]">{name || '—'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>()
        const conf = nominationStatusConfig[status as keyof typeof nominationStatusConfig]
        return <StatusBadge tone={conf?.tone ?? 'neutral'}>{conf?.label ?? status ?? 'Unknown'}</StatusBadge>
      },
    },
    createCreatedAtColumn<Nomination>({ title: 'Submitted' }),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell nomination={row.original} onActionComplete={onActionComplete} />
      ),
    },
  ]
}

interface NominationsTableProps {
  nominations: Nomination[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onActionComplete?: () => void
}

export function NominationsTable({ nominations, loading, error, onRetry, onActionComplete }: NominationsTableProps) {
  const columns = buildColumns(onActionComplete)

  if (error) return <QueryError title="Could not load nominations" message={error} onRetry={onRetry} />

  return (
    <DataTable
      data={nominations}
      columns={columns}
      loading={loading}
      showIndexColumn={false}
      emptyMessage="No nominations found."
      toolbarConfig={{ searchPlaceholder: 'Search nominations...' }}
    />
  )
}
