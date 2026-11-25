'use client'

import { useQuery } from '@apollo/client/react'
import { useParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bike, Heart, Calendar, MapPin, Phone, Mail,
  DollarSign, CheckCircle, XCircle, Clock, AlertCircle, User,
} from 'lucide-react'
import { GET_APPLICATION } from '@/graphql/queries/applications'
import Link from 'next/link'
import {
  ApproveButton,
  RejectButton,
  WaitlistButton,
  ConfirmButton,
  UpdatePaymentStatusButton,
} from '@/features/applications/components/application-actions'
import { applicationStatusConfig, paymentStatusConfig } from '@/features/applications/types'
import {
  formatResponse,
  howHeardLabel,
  medicalCertificationLabel,
  safeHttpUrl,
} from '@/features/applications/lib/format-response'
import { PageHeader, FormSection, DetailField, StatusBadge } from '@/components/admin'
import { AcceptancePanel, type AcceptanceDetail } from '@/features/applications/components/acceptance-panel'

interface ApplicationDetail {
  id: string
  rally: {
    id: string
    title: string | { en: string; mn: string }
    slug: string
    startDate: string
    endDate: string
    location: string | { en: string; mn: string }
    maxParticipants: number
    currentParticipants: number
  }
  status: string
  isRider: boolean
  hasMotorcycleLicense?: boolean
  // JSON columns: plain strings on older records, small objects from the public website
  ridingExperience?: unknown
  ridingVideoUrl?: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  address?: unknown
  birthdate?: string
  hasValidPassport: boolean
  isMedicalProfessional: boolean
  medicalCertificationType?: string | null
  medicalConditions?: unknown
  dietaryRestrictions?: unknown
  emergencyContactFirstName: string
  emergencyContactLastName: string
  emergencyContactPhone: string
  emergencyContactEmail: string
  emergencyContactRelationship: string
  socialMediaLinks?: unknown
  motivation?: unknown
  travelExperience?: unknown
  futureLocations?: unknown
  howHeard?: string | null
  depositPaid: boolean
  depositAmount?: number
  fullyPaid: boolean
  totalAmount?: number
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  acceptanceUrl?: string | null
  acceptance?: AcceptanceDetail | null
}

interface GetApplicationQuery {
  getApplication: ApplicationDetail
}

const getDisplayName = (field: string | { en: string; mn: string } | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

const formatDate = (dateString?: string) => {
  if (!dateString) return undefined
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const applicationId = params.id as string

  const { data, loading, error, refetch } = useQuery<GetApplicationQuery>(GET_APPLICATION, {
    variables: { id: applicationId },
    fetchPolicy: 'cache-and-network',
  })

  const application = data?.getApplication

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading application">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <PageHeader title="Application" backHref="/applications" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Application not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const statusConf = applicationStatusConfig[application.status as keyof typeof applicationStatusConfig]
  const getPaymentStatus = () => {
    if (application.fullyPaid) return 'FULLY_PAID'
    if (application.depositPaid) return 'DEPOSIT_PAID'
    return 'PENDING'
  }
  const paymentConf = paymentStatusConfig[getPaymentStatus() as keyof typeof paymentStatusConfig]

  const address = formatResponse(application.address)
  const ridingExperience = formatResponse(application.ridingExperience)
  const ridingVideoText = formatResponse(application.ridingVideoUrl)
  const ridingVideoHref = safeHttpUrl(application.ridingVideoUrl)
  const medicalCertification = medicalCertificationLabel(application.medicalCertificationType)
  const medicalConditions = formatResponse(application.medicalConditions)
  const dietaryRestrictions = formatResponse(application.dietaryRestrictions)
  const socialMediaLinks = formatResponse(application.socialMediaLinks)
  const motivation = formatResponse(application.motivation)
  const travelExperience = formatResponse(application.travelExperience)
  const futureLocations = formatResponse(application.futureLocations)
  const howHeard = howHeardLabel(application.howHeard)
  const hasResponses = Boolean(motivation || travelExperience || futureLocations || socialMediaLinks || howHeard)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${application.firstName} ${application.lastName}`}
        description={application.email}
        backHref="/applications"
        badge={
          <div className="flex gap-1.5">
            <StatusBadge tone={statusConf?.tone ?? 'neutral'}>{statusConf?.label ?? application.status}</StatusBadge>
            <StatusBadge tone={paymentConf.tone}>{paymentConf.label}</StatusBadge>
          </div>
        }
      />

      {/* Actions */}
      <FormSection title="Actions" description="Review and update application status">
        <div className="flex flex-wrap gap-2">
          {application.status === 'PENDING' && (
            <>
              <ApproveButton applicationId={application.id} status={application.status} onActionComplete={() => refetch()} />
              <RejectButton applicationId={application.id} status={application.status} onActionComplete={() => refetch()} />
              <WaitlistButton applicationId={application.id} status={application.status} onActionComplete={() => refetch()} />
            </>
          )}
          {application.status === 'APPROVED' &&
            (application.acceptance ? (
              <ConfirmButton applicationId={application.id} status={application.status} onActionComplete={() => refetch()} />
            ) : (
              <span className="inline-flex items-center text-xs text-muted-foreground">
                Confirm unlocks when the acceptance letter arrives
              </span>
            ))}
          <UpdatePaymentStatusButton
            applicationId={application.id}
            status={application.status}
            currentStatus={getPaymentStatus()}
            onActionComplete={() => refetch()}
          />
        </div>
      </FormSection>

      <AcceptancePanel
        applicationId={application.id}
        status={application.status}
        acceptanceUrl={application.acceptanceUrl}
        acceptance={application.acceptance}
        onLinkCreated={() => refetch()}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Full Name" value={`${application.firstName} ${application.lastName}`} icon={User} />
              <DetailField label="Email" value={application.email} icon={Mail} />
              <DetailField label="Phone" value={application.phone} icon={Phone} />
              <DetailField label="Birthdate" value={formatDate(application.birthdate)} icon={Calendar} />
              <DetailField label="Country" value={application.country} icon={MapPin} />
              <DetailField label="City" value={application.city} />
              <DetailField label="Valid Passport" value={application.hasValidPassport ? 'Yes' : 'No'} />
            </div>
            {address && (
              <DetailField label="Address" value={address} className="mt-2" />
            )}
          </FormSection>

          {/* Participation */}
          <FormSection title="Participation Details">
            <div className="flex items-center gap-2 mb-3">
              {application.isRider ? (
                <>
                  <Bike className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Rider</span>
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">Supporter</span>
                </>
              )}
            </div>
            {application.isRider && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField
                  label="Motorcycle License"
                  value={
                    <span className="flex items-center gap-1.5">
                      {application.hasMotorcycleLicense
                        ? <><CheckCircle className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Yes</>
                        : <><XCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> No</>}
                    </span>
                  }
                />
                <DetailField
                  label="Riding Experience"
                  value={ridingExperience && <span className="whitespace-pre-wrap">{ridingExperience}</span>}
                />
                {ridingVideoText && (
                  <DetailField
                    label="Riding Videos"
                    value={
                      ridingVideoHref ? (
                        <a
                          href={ridingVideoHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-primary underline underline-offset-2"
                        >
                          {ridingVideoText}
                        </a>
                      ) : (
                        <span className="break-all">{ridingVideoText}</span>
                      )
                    }
                  />
                )}
              </div>
            )}
          </FormSection>

          {/* Medical */}
          <FormSection title="Medical Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField
                label="Medical Professional"
                value={
                  <span className="flex items-center gap-1.5">
                    {application.isMedicalProfessional
                      ? <><CheckCircle className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Yes</>
                      : <><XCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> No</>}
                  </span>
                }
              />
              {medicalCertification && (
                <DetailField label="Certification" value={medicalCertification} />
              )}
            </div>
            {medicalConditions && (
              <DetailField label="Medical Conditions" value={medicalConditions} className="mt-2" />
            )}
            {dietaryRestrictions && (
              <DetailField label="Dietary Restrictions" value={dietaryRestrictions} className="mt-2" />
            )}
          </FormSection>

          {/* Emergency Contact */}
          <FormSection title="Emergency Contact">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Name" value={`${application.emergencyContactFirstName} ${application.emergencyContactLastName}`} />
              <DetailField label="Relationship" value={application.emergencyContactRelationship} />
              <DetailField label="Phone" value={application.emergencyContactPhone} icon={Phone} />
              <DetailField label="Email" value={application.emergencyContactEmail} icon={Mail} />
            </div>
          </FormSection>

          {/* Application Responses */}
          {hasResponses && (
            <FormSection title="Application Responses">
              {motivation && (
                <DetailField label="Motivation" value={<span className="whitespace-pre-wrap">{motivation}</span>} />
              )}
              {travelExperience && (
                <DetailField label="Travel Experience" value={<span className="whitespace-pre-wrap">{travelExperience}</span>} className="mt-3" />
              )}
              {futureLocations && (
                <DetailField label="Future Locations of Interest" value={<span className="whitespace-pre-wrap">{futureLocations}</span>} className="mt-3" />
              )}
              {socialMediaLinks && (
                <DetailField label="Social Media" value={<span className="whitespace-pre-wrap break-all">{socialMediaLinks}</span>} className="mt-3" />
              )}
              {howHeard && (
                <DetailField label="How They Heard About Us" value={howHeard} className="mt-3" />
              )}
            </FormSection>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rally */}
          <FormSection title="Selected Rally">
            <div className="space-y-3">
              <DetailField label="Rally" value={getDisplayName(application.rally?.title)} />
              <DetailField label="Location" value={getDisplayName(application.rally?.location)} icon={MapPin} />
              <DetailField label="Start Date" value={formatDate(application.rally?.startDate)} icon={Calendar} />
              <DetailField label="End Date" value={formatDate(application.rally?.endDate)} icon={Calendar} />
            </div>
          </FormSection>

          {/* Payment */}
          <FormSection title="Payment Details">
            <div className="space-y-3">
              <DetailField
                label="Deposit Paid"
                value={
                  <span className="flex items-center gap-1.5">
                    {application.depositPaid
                      ? <><CheckCircle className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Yes</>
                      : <><XCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> No</>}
                  </span>
                }
              />
              {application.depositAmount && (
                <DetailField label="Deposit Amount" value={`$${application.depositAmount}`} icon={DollarSign} />
              )}
              {application.totalAmount && (
                <DetailField label="Total Amount" value={`$${application.totalAmount}`} icon={DollarSign} />
              )}
            </div>
          </FormSection>

          {/* Meta */}
          <FormSection title="Application Details">
            <div className="space-y-3">
              <DetailField label="Applied On" value={formatDate(application.createdAt)} icon={Calendar} />
              {application.reviewedAt && (
                <DetailField label="Reviewed On" value={formatDate(application.reviewedAt)} icon={Clock} />
              )}
              {application.reviewedBy && (
                <DetailField label="Reviewed By" value={application.reviewedBy} />
              )}
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  )
}
