'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  FileText,
  MoreHorizontal,
  Bike,
  Heart,
  Trophy,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  CircleCheck,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'

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
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import type { Application } from '../types'
import { applicationStatusConfig, paymentStatusConfig } from '../types'
import {
  ApproveDialog,
  RejectDialog,
  WaitlistDialog,
  ConfirmDialog,
  UpdatePaymentDialog,
} from './application-actions'

type DialogAction = 'approve' | 'reject' | 'waitlist' | 'confirm' | 'payment' | null

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

function avatarColor(name: string) {
  const palette = [
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
  return palette[h % palette.length]
}

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
  application,
  onActionComplete,
}: {
  application: Application
  onActionComplete?: () => void
}) {
  const [dialog, setDialog] = useState<DialogAction>(null)

  const app = application as Application & { depositPaid?: boolean; fullyPaid?: boolean }
  const closeDialog = () => setDialog(null)
  const handleComplete = () => {
    closeDialog()
    onActionComplete?.()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/applications/${application.id}`} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          {application.status === 'PENDING' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDialog('approve')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDialog('reject')}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDialog('waitlist')}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4 text-amber-600" />
                Add to Waitlist
              </DropdownMenuItem>
            </>
          )}

          {application.status === 'APPROVED' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDialog('confirm')}
                className="flex items-center gap-2"
              >
                <CircleCheck className="h-4 w-4 text-green-600" />
                Confirm
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDialog('payment')}
            className="flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4 text-blue-600" />
            Update Payment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ApproveDialog
        open={dialog === 'approve'}
        onOpenChange={(o) => !o && closeDialog()}
        applicationId={application.id}
        onActionComplete={handleComplete}
      />
      <RejectDialog
        open={dialog === 'reject'}
        onOpenChange={(o) => !o && closeDialog()}
        applicationId={application.id}
        onActionComplete={handleComplete}
      />
      <WaitlistDialog
        open={dialog === 'waitlist'}
        onOpenChange={(o) => !o && closeDialog()}
        applicationId={application.id}
        onActionComplete={handleComplete}
      />
      <ConfirmDialog
        open={dialog === 'confirm'}
        onOpenChange={(o) => !o && closeDialog()}
        applicationId={application.id}
        onActionComplete={handleComplete}
      />
      <UpdatePaymentDialog
        open={dialog === 'payment'}
        onOpenChange={(o) => !o && closeDialog()}
        applicationId={application.id}
        depositPaid={app.depositPaid}
        fullyPaid={app.fullyPaid}
        onActionComplete={handleComplete}
      />
    </>
  )
}

function buildColumns(onActionComplete?: () => void): ColumnDef<Application>[] {
  return [
    {
      accessorKey: 'firstName',
      header: 'Applicant',
      cell: ({ row }) => {
        const app = row.original
        const fullName = `${app.firstName} ${app.lastName}`
        const initials = getInitials(app.firstName, app.lastName)
        const colorClass = avatarColor(fullName)
        return (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 text-sm font-semibold ${colorClass}`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm">{fullName}</div>
              <div className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                {app.email}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'rally',
      header: 'Rally',
      cell: ({ row }) => {
        const app = row.original
        return (
          <div className="max-w-[200px]">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
              <span className="font-medium text-sm truncate">
                {getDisplayName(app.rally?.title)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{formatDate(app.rally?.startDate || '')}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'isRider',
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge variant="outline" className="gap-1.5">
          {getValue<boolean>() ? (
            <>
              <Bike className="h-3.5 w-3.5 text-blue-500" />
              Rider
            </>
          ) : (
            <>
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Supporter
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue, row }) => {
        const status = getValue<string>()
        const conf = applicationStatusConfig[status as keyof typeof applicationStatusConfig] ?? {
          label: status ?? 'Unknown',
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          variant: 'outline' as const,
        }
        return (
          <div className="flex flex-col items-start gap-1">
            <Badge variant={conf.variant} className={conf.color}>
              {conf.label}
            </Badge>
            {row.original.acceptance && (
              <span className="text-[11px] font-medium text-emerald-600" data-acceptance-received>
                Letter received
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => {
        const app = row.original as Application & { depositPaid?: boolean; fullyPaid?: boolean }
        const key: keyof typeof paymentStatusConfig = app.fullyPaid
          ? 'FULLY_PAID'
          : app.depositPaid
            ? 'DEPOSIT_PAID'
            : ((app.paymentStatus as keyof typeof paymentStatusConfig) ?? 'PENDING')
        const conf = paymentStatusConfig[key] ?? paymentStatusConfig['PENDING']
        return (
          <Badge variant={conf.variant} className={conf.color}>
            {conf.label}
          </Badge>
        )
      },
    },
    createCreatedAtColumn<Application>({ title: 'Applied' }),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell application={row.original} onActionComplete={onActionComplete} />
      ),
    },
  ]
}

interface ApplicationsTableProps {
  applications: Application[]
  loading?: boolean
  onActionComplete?: () => void
}

export function ApplicationsTable({ applications, loading, onActionComplete }: ApplicationsTableProps) {
  const columns = buildColumns(onActionComplete)

  return (
    <DataTable
      data={applications}
      columns={columns}
      loading={loading}
      showIndexColumn={false}
      emptyMessage="No applications found."
      toolbarConfig={{ searchPlaceholder: 'Search applications...' }}
    />
  )
}
