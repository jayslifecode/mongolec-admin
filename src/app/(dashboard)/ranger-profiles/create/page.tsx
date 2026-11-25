'use client'

import { RangerProfileForm } from '@/features/ranger-profiles/components/ranger-profile-form'
import { PageHeader } from '@/components/admin'

export default function CreateRangerProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add ranger"
        description="Add a ranger to the Rally for Rangers website"
        backHref="/ranger-profiles"
      />
      <RangerProfileForm mode="create" />
    </div>
  )
}
