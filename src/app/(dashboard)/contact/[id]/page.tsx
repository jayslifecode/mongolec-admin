'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Mail, Calendar, CheckCircle, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { GET_CONTACT_MESSAGE } from '@/graphql/queries/contact'
import { UPDATE_CONTACT_MESSAGE_STATUS } from '@/graphql/mutations/contact'
import { contactMessageStatusConfig } from '@/features/contact/types'
import { PageHeader, FormSection, DetailField, EmptyState, StatusBadge } from '@/components/admin'

interface GetContactMessageData {
  contactMessage: any
}

const formatDate = (dateString?: string) => {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ContactMessageDetailPage() {
  const params = useParams()
  const messageId = params.id as string

  const { data, loading, error, refetch } = useQuery<GetContactMessageData>(
    GET_CONTACT_MESSAGE,
    { variables: { id: messageId }, skip: !messageId, fetchPolicy: 'cache-and-network' }
  )

  const [updateStatus] = useMutation(UPDATE_CONTACT_MESSAGE_STATUS, {
    onCompleted: () => {
      toast.success('Status updated')
      refetch()
    },
    onError: (err) => toast.error(err.message),
  })

  if (loading) {
    return (
      <div>
        <EmptyState icon={Mail} title="Loading message…" className="py-20" />
      </div>
    )
  }

  if (error || !data?.contactMessage) {
    return (
      <div className="space-y-6">
        <PageHeader title="Message" backHref="/contact" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error?.message || 'Message not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const message = data.contactMessage
  const statusConf = contactMessageStatusConfig[message.status as keyof typeof contactMessageStatusConfig]

  const handleStatusChange = (newStatus: string) => {
    updateStatus({ variables: { id: messageId, status: newStatus } })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={message.subject}
        description={`From ${message.name} · ${message.email}`}
        backHref="/contact"
        badge={
          <StatusBadge tone={statusConf.tone}>{statusConf.label}</StatusBadge>
        }
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Change status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Update status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(contactMessageStatusConfig).map(([key, conf]) => (
                <DropdownMenuItem
                  key={key}
                  disabled={key === message.status}
                  onClick={() => handleStatusChange(key)}
                >
                  {conf.label}
                  {key === message.status && <span className="text-muted-foreground ml-auto text-xs">Current</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <FormSection title="Message" description="What the sender wrote">
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
              {message.message}
            </p>
          </FormSection>
        </div>

        <div className="space-y-5">
          <FormSection title="Sender">
            <div className="space-y-3">
              <DetailField label="Name" value={message.name} />
              <DetailField
                label="Email"
                value={
                  <a href={`mailto:${message.email}`} className="text-primary underline-offset-2 hover:underline">
                    {message.email}
                  </a>
                }
                icon={Mail}
              />
            </div>
          </FormSection>

          <FormSection title="Details">
            <div className="space-y-3">
              <DetailField
                label="Status"
                value={<StatusBadge tone={statusConf.tone}>{statusConf.label}</StatusBadge>}
              />
              <DetailField label="Received" value={formatDate(message.createdAt)} icon={Calendar} />
            </div>
          </FormSection>

          {message.status !== 'REPLIED' && (
            <Button
              type="button"
              className="w-full"
              size="sm"
              onClick={() => handleStatusChange('REPLIED')}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Mark as replied
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
