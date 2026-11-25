'use client'

import { useQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MapPin, Globe, Mail, Building, FileText, Calendar, Clock, Trophy,
} from 'lucide-react'
import { GET_NOMINATION } from '@/graphql/queries/nominations'
import { AlertCircle } from 'lucide-react'
import {
  ApproveButton,
  RejectButton,
} from '@/features/nominations/components/nomination-actions'
import { nominationStatusConfig } from '@/features/nominations/types'
import { PageHeader, FormSection, DetailField, StatusBadge } from '@/components/admin'

interface NominationDetail {
  id: string
  country: string
  parkNames: string[]
  parkWebsites?: string[]
  parkContactFirstName: string
  parkContactLastName: string
  parkContactEmail: string
  partnerOrganizationName?: string
  partnerContactFirstName?: string
  partnerContactLastName?: string
  partnerContactEmail?: string
  partnerWebsite?: string
  partnerAddress?: string
  primaryMission?: string
  motorcycleSupport?: string
  partnerLogisticsSupport?: string
  otherInfo?: string
  howHeard?: string
  status: string
  selectedForRallyId?: string
  submittedBy?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
  updatedAt: string
}

interface GetNominationQuery {
  getNomination: NominationDetail
}

const formatDate = (dateString?: string) => {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

const str = (value: unknown): string | undefined => {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (typeof obj.description === 'string') return obj.description
    if (typeof obj.en === 'string') return obj.en
    if (typeof obj.mn === 'string') return obj.mn
    return JSON.stringify(obj)
  }
  return String(value)
}

export default function NominationDetailPage() {
  const params = useParams()
  const nominationId = params.id as string

  const { data, loading, error, refetch } = useQuery<GetNominationQuery>(GET_NOMINATION, {
    variables: { id: nominationId },
    fetchPolicy: 'cache-and-network',
  })

  const nomination = data?.getNomination

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading nomination">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !nomination) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nomination" backHref="/nominations" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Nomination not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const parkName = Array.isArray(nomination.parkNames) ? nomination.parkNames[0] : str(nomination.parkNames) ?? ''
  const statusConf = nominationStatusConfig[nomination.status as keyof typeof nominationStatusConfig]

  return (
    <div className="space-y-6">
      <PageHeader
        title={parkName}
        description={nomination.country}
        backHref="/nominations"
        badge={
          <StatusBadge tone={statusConf?.tone ?? 'neutral'}>{statusConf?.label ?? nomination.status}</StatusBadge>
        }
      />

      {/* Actions */}
      <FormSection title="Actions" description="Review and update nomination status">
        <div className="flex flex-wrap gap-2">
          {nomination.status !== 'PENDING' && nomination.status !== 'UNDER_REVIEW' && (
            <p className="text-sm text-muted-foreground">No review actions are available for this status.</p>
          )}
          {(nomination.status === 'PENDING' || nomination.status === 'UNDER_REVIEW') && (
            <>
              <ApproveButton nominationId={nomination.id} status={nomination.status} onActionComplete={() => refetch()} />
              <RejectButton nominationId={nomination.id} status={nomination.status} onActionComplete={() => refetch()} />
            </>
          )}
        </div>
      </FormSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Park Information */}
          <FormSection title="Park Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Park Name" value={parkName} icon={MapPin} />
              <DetailField label="Country" value={nomination.country} />
              {nomination.parkWebsites?.[0] && (
                <DetailField
                  label="Website"
                  value={
                    <a href={nomination.parkWebsites[0]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" />
                      {nomination.parkWebsites[0]}
                    </a>
                  }
                />
              )}
            </div>
          </FormSection>

          {/* Park Contact */}
          <FormSection title="Park Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Contact Name"
                value={`${nomination.parkContactFirstName} ${nomination.parkContactLastName}`.trim() || undefined}
              />
              <DetailField
                label="Email"
                value={nomination.parkContactEmail ? (
                  <a href={`mailto:${nomination.parkContactEmail}`} className="text-primary underline underline-offset-2">
                    {nomination.parkContactEmail}
                  </a>
                ) : undefined}
                icon={Mail}
              />
            </div>
          </FormSection>

          {/* Partner Organization */}
          {(str(nomination.partnerOrganizationName) || nomination.partnerContactEmail || nomination.partnerWebsite) && (
            <FormSection title="Partner Organization">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {str(nomination.partnerOrganizationName) && (
                  <DetailField label="Organization" value={str(nomination.partnerOrganizationName)} icon={Building} />
                )}
                {(nomination.partnerContactFirstName || nomination.partnerContactLastName) && (
                  <DetailField
                    label="Contact Person"
                    value={`${nomination.partnerContactFirstName ?? ''} ${nomination.partnerContactLastName ?? ''}`.trim()}
                  />
                )}
                {nomination.partnerContactEmail && (
                  <DetailField
                    label="Email"
                    value={
                      <a href={`mailto:${nomination.partnerContactEmail}`} className="text-primary underline underline-offset-2">
                        {nomination.partnerContactEmail}
                      </a>
                    }
                    icon={Mail}
                  />
                )}
                {nomination.partnerWebsite && (
                  <DetailField
                    label="Website"
                    value={
                      <a href={nomination.partnerWebsite} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {nomination.partnerWebsite}
                      </a>
                    }
                  />
                )}
              </div>
              {str(nomination.partnerAddress) && (
                <DetailField label="Address" value={<span className="whitespace-pre-wrap">{str(nomination.partnerAddress)}</span>} className="mt-2" />
              )}
            </FormSection>
          )}

          {/* Mission & Support */}
          {(str(nomination.primaryMission) || str(nomination.motorcycleSupport) || str(nomination.partnerLogisticsSupport) || str(nomination.otherInfo)) && (
            <FormSection title="Mission & Support">
              {str(nomination.primaryMission) && (
                <DetailField label="Primary Mission" value={<span className="whitespace-pre-wrap">{str(nomination.primaryMission)}</span>} icon={FileText} />
              )}
              {str(nomination.motorcycleSupport) && (
                <DetailField label="Motorcycle Support" value={<span className="whitespace-pre-wrap">{str(nomination.motorcycleSupport)}</span>} className="mt-3" />
              )}
              {str(nomination.partnerLogisticsSupport) && (
                <DetailField label="Logistics Support" value={<span className="whitespace-pre-wrap">{str(nomination.partnerLogisticsSupport)}</span>} className="mt-3" />
              )}
              {str(nomination.otherInfo) && (
                <DetailField label="Additional Information" value={<span className="whitespace-pre-wrap">{str(nomination.otherInfo)}</span>} className="mt-3" />
              )}
            </FormSection>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <FormSection title="Nomination Details">
            <div className="space-y-3">
              <DetailField label="Nominated On" value={formatDate(nomination.createdAt)} icon={Calendar} />
              {nomination.reviewedAt && (
                <DetailField label="Reviewed On" value={formatDate(nomination.reviewedAt)} icon={Clock} />
              )}
              {nomination.reviewedBy && (
                <DetailField label="Reviewed By" value={nomination.reviewedBy} />
              )}
              {nomination.submittedBy && (
                <DetailField label="Submitted By" value={nomination.submittedBy} />
              )}
              {nomination.selectedForRallyId && (
                <DetailField label="Selected for Rally" value={nomination.selectedForRallyId} icon={Trophy} />
              )}
            </div>
          </FormSection>

          {nomination.reviewNotes && (
            <FormSection title="Review Notes">
              <p className="text-sm whitespace-pre-wrap text-foreground/80">{nomination.reviewNotes}</p>
            </FormSection>
          )}
        </div>
      </div>
    </div>
  )
}
