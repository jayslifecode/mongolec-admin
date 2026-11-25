'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Shield, Plus } from 'lucide-react'
import { RangerProfileTable } from '@/features/ranger-profiles/components/ranger-profile-table'
import { GET_RANGERS_PROFILES } from '@/graphql/queries/ranger-profiles'
import { ListError } from '@/features/people/components/list-error'
import Link from 'next/link'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'
import type { RangerProfile } from '@/features/ranger-profiles/types'

const RANGERS_PAGE_SIZE = 500

interface GetRangersData {
  getRangers: {
    rangers: RangerProfile[]
    pagination: {
      total: number
    }
  }
}

export default function RangerProfilesPage() {
  const { data, loading, error, refetch } = useQuery<GetRangersData>(GET_RANGERS_PROFILES, {
    variables: { limit: RANGERS_PAGE_SIZE, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const rangers = data?.getRangers.rangers ?? []

  const total = data?.getRangers.pagination.total ?? rangers.length
  const active = rangers.filter((r) => r.isActive).length
  const isInitialLoad = loading && !data

  const stats = [
    { label: 'Total', value: total },
    { label: 'Active', value: active },
    { label: 'Inactive', value: rangers.length - active },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ranger Profiles"
        description="Rangers featured on the Rally for Rangers website"
        actions={
          <Button size="sm" asChild>
            <Link href="/ranger-profiles/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Add ranger
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={isInitialLoad} />

      {error && !data ? (
        <ListError message={error.message} onRetry={() => refetch()} />
      ) : !isInitialLoad && rangers.length === 0 ? (
        <div className="border-border bg-card rounded-xl border">
          <EmptyState
            icon={Shield}
            title="No ranger profiles yet"
            description="Add your first ranger profile to get started."
          />
        </div>
      ) : (
        <RangerProfileTable rangers={rangers} loading={isInitialLoad} onActionComplete={() => refetch()} />
      )}
    </div>
  )
}
