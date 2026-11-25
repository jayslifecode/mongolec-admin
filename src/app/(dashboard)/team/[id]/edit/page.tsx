'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { TeamMemberForm } from '@/features/team/components/team-member-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Users } from 'lucide-react'
import { GET_TEAM_MEMBERS } from '@/graphql/queries/team'
import { PageHeader, EmptyState } from '@/components/admin'

interface GetTeamMembersData {
  getTeamMembers: any[]
}

export default function TeamMemberEditPage() {
  const params = useParams()
  const memberId = params.id as string

  const { data, loading, error } = useQuery<GetTeamMembersData>(GET_TEAM_MEMBERS, {
    fetchPolicy: 'cache-first',
  })

  const member = data?.getTeamMembers?.find((m: any) => m.id === memberId)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={Users} title="Loading member…" className="py-20" />
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Edit team member" backHref="/team" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error?.message || 'Team member not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={member.name}
        description="Update team member information"
        backHref="/team"
      />
      <TeamMemberForm mode="edit" initialData={member} memberId={memberId} />
    </div>
  )
}
