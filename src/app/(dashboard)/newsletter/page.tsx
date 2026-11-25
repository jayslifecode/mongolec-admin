'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Mail, Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import { PageHeader, StatBar, EmptyState, StatusBadge } from '@/components/admin'
import { ListError } from '@/features/people/components/list-error'
import { GET_NEWSLETTER_SUBSCRIPTIONS } from '@/graphql/queries/newsletter'
import {
  SUBSCRIBER_STATUS_BADGE,
  SUBSCRIPTION_STATUSES,
  countByStatus,
  filterSubscribers,
  type Subscriber,
  type SubscriptionStatus,
} from '@/features/newsletter/lib/subscribers'

/** Ask for every subscriber so the counts match the API's total. */
const SUBSCRIBERS_PAGE_SIZE = 500

interface GetNewsletterSubscriptionsData {
  getNewsletterSubscriptions: {
    subscriptions: Subscriber[]
    pagination: { total: number }
  }
}

const dash = <span className="text-muted-foreground text-sm">—</span>

const columns: ColumnDef<Subscriber>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
  },
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const name = [row.original.firstName, row.original.lastName].filter(Boolean).join(' ')
      return name ? <span className="text-sm">{name}</span> : dash
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<SubscriptionStatus>()
      const conf = SUBSCRIBER_STATUS_BADGE[status]
      return <StatusBadge tone={conf?.tone ?? 'neutral'}>{conf?.label ?? status}</StatusBadge>
    },
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ getValue }) => {
      const source = getValue<string | null>()
      return source ? <span className="text-sm">{source}</span> : dash
    },
  },
  createCreatedAtColumn<Subscriber>({ title: 'Subscribed' }),
]

export default function NewsletterPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all')

  const { data, loading, error, refetch } = useQuery<GetNewsletterSubscriptionsData>(GET_NEWSLETTER_SUBSCRIPTIONS, {
    variables: { limit: SUBSCRIBERS_PAGE_SIZE, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const subscribers = data?.getNewsletterSubscriptions?.subscriptions ?? []
  const total = data?.getNewsletterSubscriptions?.pagination?.total ?? subscribers.length
  const isInitialLoad = loading && !data
  const counts = useMemo(() => countByStatus(subscribers), [subscribers])
  const visible = useMemo(
    () => filterSubscribers(subscribers, query, statusFilter),
    [subscribers, query, statusFilter],
  )

  const stats = [
    { label: 'Total', value: total },
    { label: 'Active', value: counts.ACTIVE },
    { label: 'Unsubscribed', value: counts.UNSUBSCRIBED },
  ]

  const hasFilters = Boolean(query.trim()) || statusFilter !== 'all'

  return (
    <div className="space-y-6">
      <PageHeader title="Newsletter" description="People who signed up for the newsletter" />

      <StatBar stats={stats} loading={isInitialLoad} />

      {error && !data ? (
        <ListError message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" aria-hidden="true" />
              <Input
                type="search"
                aria-label="Search subscribers by email or name"
                placeholder="Search subscribers…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-[240px] pl-8 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubscriptionStatus | 'all')}>
              <SelectTrigger className="h-9 w-[170px] text-sm" aria-label="Filter by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {SUBSCRIPTION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SUBSCRIBER_STATUS_BADGE[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isInitialLoad && visible.length === 0 ? (
            <div className="border-border bg-card rounded-xl border">
              <EmptyState
                icon={Mail}
                title={hasFilters ? 'No subscribers match' : 'No subscribers yet'}
                description={
                  hasFilters ? 'Try a different search or status.' : 'People who sign up will appear here.'
                }
              />
            </div>
          ) : (
            <DataTable
              data={visible}
              columns={columns}
              loading={isInitialLoad}
              showIndexColumn={false}
              emptyMessage="No subscribers found."
            />
          )}
        </div>
      )}
    </div>
  )
}
