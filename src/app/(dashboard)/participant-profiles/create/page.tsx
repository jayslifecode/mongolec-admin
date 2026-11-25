'use client'

import { ParticipantProfileForm } from '@/features/participant-profiles/components/participant-profile-form'
import { PageHeader } from '@/components/admin'

export default function CreateParticipantProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add rider"
        description="Add a rider to the Rally for Rangers listing"
        backHref="/participant-profiles"
      />
      <ParticipantProfileForm mode="create" />
    </div>
  )
}
