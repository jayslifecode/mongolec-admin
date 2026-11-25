'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Calendar, MapPin, Users, Pencil } from 'lucide-react'
import Link from 'next/link'
import { GET_RALLY_BY_ID } from '@/graphql/queries/rallies'
import { GET_APPLICATIONS } from '@/graphql/queries/applications'
import { PageHeader, FormSection, DetailField, StatusBadge } from '@/components/admin'
import { rallyStatusConfig, type RallyStatus } from '@/features/rallies/types'
import { ApplicationsTable } from '@/features/applications/components/applications-table'
import type { Application } from '@/features/applications/types'

interface GetRallyByIdData {
  getRally: any
}

interface GetApplicationsData {
  getApplications: { applications: Application[] }
}

export default function RallyDetailPage() {
  const params = useParams()
  const rallyId = params.id as string

  const { data, loading, error } = useQuery<GetRallyByIdData>(GET_RALLY_BY_ID, {
    variables: { id: rallyId },
    skip: !rallyId,
  })

  const { data: appsData, loading: appsLoading, error: appsError, refetch: refetchApps } = useQuery<GetApplicationsData>(
    GET_APPLICATIONS,
    { variables: { rallyId, limit: 100 }, skip: !rallyId }
  )

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading rally">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error || !data?.getRally) {
    return (
      <div className="space-y-6">
        <PageHeader title="Rally" backHref="/rallies" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Rally not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const rally = data.getRally

  const getDisplayName = (field: string | { en: string; mn: string } | undefined): string => {
    if (!field) return ''
    if (typeof field === 'string') return field
    return field.en || field.mn || ''
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

  const spotsLeft = rally.maxParticipants
    ? rally.maxParticipants - (rally.currentParticipants || 0)
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title={getDisplayName(rally.title) || 'Rally Details'}
        description="Rally details and participant information"
        backHref="/rallies"
        actions={
          <Button size="sm" asChild>
            <Link href={`/rallies/${rallyId}/edit`}>
              <Pencil className="h-4 w-4 mr-2" aria-hidden="true" />
              Edit Rally
            </Link>
          </Button>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge tone={rallyStatusConfig[rally.status as RallyStatus]?.tone ?? 'neutral'}>
              {rallyStatusConfig[rally.status as RallyStatus]?.label ?? rally.status}
            </StatusBadge>
            {rally.isRecruiting && <StatusBadge tone="success">Recruiting</StatusBadge>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Participants</p>
          <p className="mt-1.5 text-2xl font-bold">
            {rally.currentParticipants || 0}
            {rally.maxParticipants && (
              <span className="text-sm font-normal text-muted-foreground"> / {rally.maxParticipants}</span>
            )}
          </p>
          {spotsLeft !== null && (
            <p className="text-xs text-muted-foreground mt-0.5">{spotsLeft} spots remaining</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</p>
          <p className="mt-1.5 text-2xl font-bold">{rally.duration || '—'}</p>
          {rally.duration && <p className="text-xs text-muted-foreground mt-0.5">days</p>}
        </div>
      </div>

      <FormSection title="Basic Information">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailField label="Slug" value={rally.slug} />
          <DetailField label="Status" value={rallyStatusConfig[rally.status as RallyStatus]?.label ?? rally.status} />
        </div>
        {getDisplayName(rally.description) && (
          <DetailField label="Description" value={
            <p className="whitespace-pre-wrap leading-relaxed">{getDisplayName(rally.description)}</p>
          } />
        )}
      </FormSection>

      <FormSection title="Schedule & Location">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailField label="Start Date" icon={Calendar} value={rally.startDate ? formatDate(rally.startDate) : undefined} />
          <DetailField label="End Date" icon={Calendar} value={rally.endDate ? formatDate(rally.endDate) : undefined} />
          <DetailField label="Location" icon={MapPin} value={getDisplayName(rally.location) || undefined} />
          {rally.applicationDeadline && (
            <DetailField label="Application Deadline" value={formatDate(rally.applicationDeadline)} />
          )}
        </div>
      </FormSection>

      <FormSection title="Participants">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailField label="Target Audience" icon={Users} value={getDisplayName(rally.targetAudience) || undefined} />
          <DetailField label="Max Participants" value={rally.maxParticipants ?? undefined} />
          <DetailField label="Current Participants" value={rally.currentParticipants || 0} />
        </div>
      </FormSection>

      {(getDisplayName(rally.highlights) || getDisplayName(rally.rangerPartnerships)) && (
        <FormSection title="Highlights & Partnerships">
          {getDisplayName(rally.highlights) && (
            <DetailField label="Highlights" value={
              <p className="whitespace-pre-wrap leading-relaxed">{getDisplayName(rally.highlights)}</p>
            } />
          )}
          {getDisplayName(rally.rangerPartnerships) && (
            <DetailField label="Ranger Partnerships" value={
              <p className="whitespace-pre-wrap leading-relaxed">{getDisplayName(rally.rangerPartnerships)}</p>
            } />
          )}
        </FormSection>
      )}

      {(rally.heroImage || rally.heroVideo) && (
        <FormSection title="Media">
          {rally.heroImage && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hero Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={rally.heroImage}
                alt={`Hero image for ${getDisplayName(rally.title) || 'this rally'}`}
                className="h-60 w-full object-cover rounded-lg border border-border"
              />
            </div>
          )}
          {rally.heroVideo && (
            <DetailField label="Hero Video URL" value={rally.heroVideo} />
          )}
        </FormSection>
      )}

      <FormSection title="Metadata">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <DetailField label="Created" value={rally.createdAt ? formatDate(rally.createdAt) : undefined} />
          <DetailField label="Last Updated" value={rally.updatedAt ? formatDate(rally.updatedAt) : undefined} />
        </div>
      </FormSection>

      <FormSection title={`Applications (${appsData?.getApplications?.applications?.length ?? 0})`}>
        <ApplicationsTable
          applications={appsData?.getApplications?.applications ?? []}
          loading={appsLoading}
          error={appsError?.message}
          onRetry={() => refetchApps()}
          onActionComplete={() => refetchApps()}
        />
      </FormSection>
    </div>
  )
}
