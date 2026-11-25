'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { RangerProfileForm } from '@/features/ranger-profiles/components/ranger-profile-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Shield } from 'lucide-react'
import { GET_RANGER_PROFILE } from '@/graphql/queries/ranger-profiles'
import { PageHeader, EmptyState } from '@/components/admin'

interface GetRangerData {
  getRanger: {
    id: string
    name: string
    photo?: string
    parkName: string
    country: string
    bio?: string
    displayOrder: number
    isActive: boolean
    rallyId?: string
    createdAt: string
    updatedAt: string
  } | null
}

export default function EditRangerProfilePage() {
  const params = useParams()
  const rangerId = params.id as string

  const { data, loading, error } = useQuery<GetRangerData>(GET_RANGER_PROFILE, {
    variables: { id: rangerId },
    fetchPolicy: 'cache-first',
  })

  const ranger = data?.getRanger

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={Shield} title="Loading ranger…" className="py-20" />
      </div>
    )
  }

  if (error || !ranger) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader title="Edit ranger" backHref="/ranger-profiles" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error?.message || 'Ranger not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={ranger.name}
        description="Update ranger profile information"
        backHref="/ranger-profiles"
      />
      <RangerProfileForm mode="edit" initialData={ranger} rangerId={rangerId} />
    </div>
  )
}
