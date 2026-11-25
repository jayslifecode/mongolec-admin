'use client'

import { TeamMemberForm } from '@/features/team/components/team-member-form'
import { PageHeader } from '@/components/admin'

export default function CreateTeamMemberPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add team member"
        description="Add a person to your team page"
        backHref="/team"
      />
      <TeamMemberForm mode="create" />
    </div>
  )
}
