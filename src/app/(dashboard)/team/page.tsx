'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { TeamTable } from '@/features/team/components/team-table'
import { GET_TEAM_MEMBERS } from '@/graphql/queries/team'
import { ListError } from '@/features/people/components/list-error'
import Link from 'next/link'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'
import type { TeamMember } from '@/features/team/types'

interface GetTeamMembersData {
  getTeamMembers: TeamMember[]
}

export default function TeamPage() {
  const { data, loading, error, refetch } = useQuery<GetTeamMembersData>(
    GET_TEAM_MEMBERS,
    { fetchPolicy: 'cache-and-network' }
  )

  const members = data?.getTeamMembers ?? []

  const active = members.filter((m) => m.isActive).length
  const isInitialLoad = loading && !data

  const stats = [
    { label: 'Total', value: members.length },
    { label: 'Active', value: active },
    { label: 'Inactive', value: members.length - active },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="The people shown on your team page, including inactive members"
        actions={
          <Button size="sm" asChild>
            <Link href="/team/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Add member
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={isInitialLoad} />

      {error && !data ? (
        <ListError message={error.message} onRetry={() => refetch()} />
      ) : !isInitialLoad && members.length === 0 ? (
        <div className="border-border bg-card rounded-xl border">
          <EmptyState icon={Users} title="No team members yet" description="Add your first team member to get started." />
        </div>
      ) : (
        <TeamTable members={members} loading={isInitialLoad} onActionComplete={() => refetch()} />
      )}
    </div>
  )
}
