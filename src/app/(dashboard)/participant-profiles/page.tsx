'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { ParticipantProfileTable } from '@/features/participant-profiles/components/participant-profile-table'
import { GET_PARTICIPANT_PROFILES } from '@/graphql/queries/participant-profiles'
import { computeRiderStats } from '@/features/participant-profiles/lib/rider-stats'
import { ListError } from '@/features/people/components/list-error'
import Link from 'next/link'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'
import type { ParticipantProfile } from '@/features/participant-profiles/types'

/** The API accepts a large page; ask for every rider so the table and the stats agree. */
const RIDERS_PAGE_SIZE = 500

interface GetParticipantsData {
  getParticipants: {
    participants: ParticipantProfile[]
    pagination: {
      total: number
    }
  }
}

export default function RidersPage() {
  const { data, loading, error, refetch } = useQuery<GetParticipantsData>(
    GET_PARTICIPANT_PROFILES,
    {
      variables: { limit: RIDERS_PAGE_SIZE, page: 1 },
      fetchPolicy: 'cache-and-network',
    },
  )

  const riders = data?.getParticipants.participants ?? []
  const stats = computeRiderStats(riders, data?.getParticipants.pagination.total)
  const isInitialLoad = loading && !data

  const statItems = [
    { label: 'Total', value: stats.total },
    { label: 'Active', value: stats.active },
    { label: 'Inactive', value: stats.inactive },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Riders"
        description="Riders who have joined a Rally for Rangers rally"
        actions={
          <Button size="sm" asChild>
            <Link href="/participant-profiles/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Add rider
            </Link>
          </Button>
        }
      />

      <StatBar stats={statItems} loading={isInitialLoad} />

      {stats.isPartial && !isInitialLoad && (
        <p className="text-muted-foreground text-sm">
          Showing {riders.length} of {stats.total} riders. Active and inactive counts cover the riders shown.
        </p>
      )}

      {error && !data ? (
        <ListError message={error.message} onRetry={() => refetch()} />
      ) : !isInitialLoad && riders.length === 0 ? (
        <div className="border-border bg-card rounded-xl border">
          <EmptyState
            icon={Users}
            title="No riders yet"
            description="Add your first rider to get started."
          />
        </div>
      ) : (
        <ParticipantProfileTable
          participants={riders}
          loading={isInitialLoad}
          onActionComplete={() => refetch()}
        />
      )}
    </div>
  )
}
