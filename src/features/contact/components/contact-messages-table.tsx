'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Eye, Mail, MailOpen, CheckCircle2 } from 'lucide-react'
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
import { InitialsAvatar, StatusBadge } from '@/components/admin'
import type { ContactMessage, ContactMessageStatus } from '../types'
import { contactMessageStatusConfig } from '../types'
import { UPDATE_CONTACT_MESSAGE_STATUS } from '@/graphql/mutations/contact'


function getStatusIcon(status: string) {
  if (status === 'NEW') return Mail
  if (status === 'READ') return MailOpen
  return CheckCircle2
}

const statusIcons = {
  NEW: Mail,
  READ: MailOpen,
  REPLIED: CheckCircle2,
}

function ActionsCell({
  message,
  onStatusChange,
}: {
  message: ContactMessage
  onStatusChange: (id: string, status: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Actions for message from ${message.name}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/contact/${message.id}`} className="flex items-center gap-2">
            <Eye className="h-4 w-4" aria-hidden="true" />
            View message
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1">
          Mark as
        </DropdownMenuLabel>
        {(Object.entries(contactMessageStatusConfig) as [ContactMessageStatus, { label: string }][]).map(([key, config]) => {
          const Icon = statusIcons[key]
          const isCurrent = message.status === key
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => !isCurrent && onStatusChange(message.id, key)}
              disabled={isCurrent}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {config.label}
              {isCurrent && (
                <CheckCircle2 className="text-muted-foreground ml-auto h-3 w-3" aria-label="Current status" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(
  onStatusChange: (id: string, status: string) => void
): ColumnDef<ContactMessage>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Sender',
      cell: ({ row }) => {
        const message = row.original
        const isUnread = message.status === 'NEW'
        return (
          <div className="flex items-center gap-3">
            <InitialsAvatar name={message.name} size={36} />
            <div className="min-w-0">
              <div className={`truncate text-sm ${isUnread ? 'font-semibold' : 'font-normal'}`}>{message.name}</div>
              <div className="text-muted-foreground truncate text-xs">{message.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'subject',
      header: 'Message',
      cell: ({ row }) => {
        const message = row.original
        return (
          <div className="max-w-[200px]">
            <div className={`truncate text-sm ${message.status === 'NEW' ? 'font-semibold' : 'font-normal'}`}>
              {message.subject}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {message.message?.slice(0, 80)}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>()
        const conf = contactMessageStatusConfig[status as keyof typeof contactMessageStatusConfig]
        const Icon = getStatusIcon(status)
        return (
          <StatusBadge tone={conf.tone}>
            <Icon className="h-3 w-3" aria-hidden="true" />
            {conf.label}
          </StatusBadge>
        )
      },
    },
    createCreatedAtColumn<ContactMessage>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <ActionsCell message={row.original} onStatusChange={onStatusChange} />
      ),
    },
  ]
}

interface ContactMessagesTableProps {
  messages: ContactMessage[]
  loading?: boolean
  onActionComplete?: () => void
}

export function ContactMessagesTable({
  messages,
  loading,
  onActionComplete,
}: ContactMessagesTableProps) {
  const [updateStatus] = useMutation(UPDATE_CONTACT_MESSAGE_STATUS, {
    onCompleted: () => {
      toast.success('Status updated')
      onActionComplete?.()
    },
    onError: error => toast.error(error.message),
  })

  const handleStatusChange = (id: string, status: string) => {
    updateStatus({ variables: { id, status } })
  }

  const columns = buildColumns(handleStatusChange)

  return (
    <DataTable
      data={messages}
      columns={columns}
      loading={loading}
      showIndexColumn={false}
      emptyMessage="No messages found."
      toolbarConfig={{ searchPlaceholder: 'Search messages...' }}
    />
  )
}
