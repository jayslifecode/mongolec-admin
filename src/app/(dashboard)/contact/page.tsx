'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail } from 'lucide-react'
import { ContactMessagesTable } from '@/features/contact/components/contact-messages-table'
import { GET_CONTACT_MESSAGES } from '@/graphql/queries/contact'
import { ListError } from '@/features/people/components/list-error'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'
import type { ContactMessage } from '@/features/contact/types'

interface GetContactMessagesData {
  getContactMessages: {
    items: ContactMessage[]
    total: number
    page: number
    limit: number
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'new', label: 'New', filter: 'NEW' },
  { value: 'read', label: 'Read', filter: 'READ' },
  { value: 'replied', label: 'Replied', filter: 'REPLIED' },
]

const MESSAGES_PAGE_SIZE = 500

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('all')

  // Load all statuses once so the counts stay right on every tab; tabs filter on the client.
  const { data, loading, error, refetch } = useQuery<GetContactMessagesData>(GET_CONTACT_MESSAGES, {
    variables: { page: 1, limit: MESSAGES_PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  })

  const allMessages = data?.getContactMessages?.items ?? []
  const total = data?.getContactMessages?.total ?? allMessages.length
  const isInitialLoad = loading && !data
  const activeFilter = STATUS_TABS.find((t) => t.value === activeTab)?.filter
  const messages = activeFilter ? allMessages.filter((m) => m.status === activeFilter) : allMessages

  const countBy = (status: string) => allMessages.filter((m) => m.status === status).length
  const stats = [
    { label: 'Total', value: total },
    { label: 'New', value: countBy('NEW') },
    { label: 'Read', value: countBy('READ') },
    { label: 'Replied', value: countBy('REPLIED') },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Contact Messages" description="Messages sent through the website contact form" />

      <StatBar stats={stats} loading={isInitialLoad} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4 text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4">
          {error && !data ? (
            <ListError message={error.message} onRetry={() => refetch()} />
          ) : !isInitialLoad && messages.length === 0 ? (
            <div className="border-border bg-card rounded-xl border">
              <EmptyState
                icon={Mail}
                title="No messages"
                description={
                  activeFilter ? 'No messages with this status.' : 'Messages from the contact form will appear here.'
                }
              />
            </div>
          ) : (
            <ContactMessagesTable messages={messages} loading={isInitialLoad} onActionComplete={() => refetch()} />
          )}
        </div>
      </Tabs>
    </div>
  )
}
