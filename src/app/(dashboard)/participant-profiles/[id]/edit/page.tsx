'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { ParticipantProfileForm } from '@/features/participant-profiles/components/participant-profile-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Users } from 'lucide-react'
import { GET_PARTICIPANT_PROFILE } from '@/graphql/queries/participant-profiles'
import { PageHeader, EmptyState } from '@/components/admin'
import type { ParticipantProfile } from '@/features/participant-profiles/types'

interface GetParticipantData {
  getParticipant: ParticipantProfile | null
}

export default function EditParticipantProfilePage() {
  const params = useParams()
  const participantId = params.id as string

  const { data, loading, error } = useQuery<GetParticipantData>(GET_PARTICIPANT_PROFILE, {
    variables: { id: participantId },
    fetchPolicy: 'cache-first',
  })

  const participant = data?.getParticipant

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={Users} title="Loading rider…" className="py-20" />
      </div>
    )
  }

  if (error || !participant) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Edit rider" backHref="/participant-profiles" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Rider not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={`${participant.firstName} ${participant.lastName}`}
        description="Update this rider"
        backHref="/participant-profiles"
      />
      <ParticipantProfileForm
        mode="edit"
        initialData={participant}
        participantId={participantId}
      />
    </div>
  )
}
