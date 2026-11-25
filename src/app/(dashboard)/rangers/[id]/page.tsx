'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Pencil, MapPin, Calendar, Users, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { GET_PARK_PARTNERSHIP } from '@/graphql/queries/rangers'
import { partnershipStatusConfig } from '@/features/rangers/types'
import { PageHeader, FormSection, DetailField, EmptyState, StatusBadge } from '@/components/admin'

interface GetParkPartnershipData {
  getParkPartnership: any
}

const getStr = (field: string | { en: string; mn: string } | undefined): string | undefined => {
  if (!field) return undefined
  if (typeof field === 'string') return field || undefined
  return field.en || field.mn || undefined
}

const formatDate = (dateString?: string) => {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function RangerDetailPage() {
  const params = useParams()
  const rangerId = params.id as string

  const { data, loading, error } = useQuery<GetParkPartnershipData>(
    GET_PARK_PARTNERSHIP,
    { variables: { id: rangerId }, skip: !rangerId, fetchPolicy: 'cache-and-network' }
  )

  if (loading) {
    return (
      <div>
        <EmptyState icon={MapPin} title="Loading park partner…" className="py-20" />
      </div>
    )
  }

  const ranger = data?.getParkPartnership

  if (error || !ranger) {
    return (
      <div className="space-y-6">
        <PageHeader title="Park Partner" backHref="/rangers" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error?.message || 'Park partner not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusConf = partnershipStatusConfig[ranger.status as keyof typeof partnershipStatusConfig]

  return (
    <div className="space-y-6">
      <PageHeader
        title={getStr(ranger.parkName) ?? 'Park Partner'}
        description={ranger.country}
        backHref="/rangers"
        badge={
          <StatusBadge tone={statusConf.tone}>{statusConf.label}</StatusBadge>
        }
        actions={
          <Button size="sm" asChild>
            <Link href={`/rangers/${rangerId}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <FormSection title="Park Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Park Name" value={getStr(ranger.parkName)} icon={MapPin} />
              <DetailField label="Country" value={ranger.country} />
              <DetailField label="Location" value={getStr(ranger.location)} />
              <DetailField label="Partnership Type" value={getStr(ranger.partnershipType)} />
              {ranger.establishedDate && (
                <DetailField label="Established" value={formatDate(ranger.establishedDate)} icon={Calendar} />
              )}
              {ranger.rangersCount != null && (
                <DetailField label="Number of Rangers" value={String(ranger.rangersCount)} icon={Users} />
              )}
              {getStr(ranger.areaSize) && (
                <DetailField label="Area Size" value={getStr(ranger.areaSize)} />
              )}
            </div>
          </FormSection>

          {getStr(ranger.keyChallenges) && (
            <FormSection title="Key Challenges">
              <p className="text-sm whitespace-pre-wrap text-foreground/80">{getStr(ranger.keyChallenges)}</p>
            </FormSection>
          )}
        </div>

        <div className="space-y-5">
          {(ranger.contactPerson || ranger.contactEmail || ranger.contactPhone) && (
            <FormSection title="Contact Person">
              <div className="space-y-3">
                {ranger.contactPerson && (
                  <DetailField label="Name" value={ranger.contactPerson} />
                )}
                {ranger.contactEmail && (
                  <DetailField
                    label="Email"
                    value={
                      <a href={`mailto:${ranger.contactEmail}`} className="text-primary underline-offset-2 hover:underline">
                        {ranger.contactEmail}
                      </a>
                    }
                    icon={Mail}
                  />
                )}
                {ranger.contactPhone && (
                  <DetailField
                    label="Phone"
                    value={
                      <a href={`tel:${ranger.contactPhone}`} className="text-primary underline-offset-2 hover:underline">
                        {ranger.contactPhone}
                      </a>
                    }
                    icon={Phone}
                  />
                )}
              </div>
            </FormSection>
          )}

          <FormSection title="Metadata">
            <div className="space-y-3">
              <DetailField label="Created" value={formatDate(ranger.createdAt)} icon={Calendar} />
              <DetailField label="Updated" value={formatDate(ranger.updatedAt)} icon={Calendar} />
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}
