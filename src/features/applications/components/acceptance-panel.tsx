'use client'

import { useState } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { CheckCircle, Clock, Copy, Download, Link2, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DetailField, FormSection } from '@/components/admin'
import { ENSURE_ACCEPTANCE_LINK } from '@/graphql/mutations/applications'
import { GET_ACCEPTANCE_PASSPORT } from '@/graphql/queries/applications'
import { formatResponse, roomingLabel } from '@/features/applications/lib/format-response'

export interface AcceptanceDetail {
  id: string
  firstName: string
  lastName: string
  email: string
  agreedToCommitment: boolean
  agreedToLiability: boolean
  usePastPhotoAndBio: boolean
  photoUrl?: string | null
  bio?: string | null
  shippingAddress?: unknown
  tshirtSize: string
  dietaryRestrictions: string
  roomingPreference: string
  roommatePreference?: string | null
  questions?: string | null
  hasPassport: boolean
  passportFileName?: string | null
  submittedAt: string
}

interface AcceptancePanelProps {
  applicationId: string
  status: string
  acceptanceUrl?: string | null
  acceptance?: AcceptanceDetail | null
  onLinkCreated: () => void
}

interface PassportResult {
  getAcceptancePassport: { fileName: string; mimeType: string; base64: string } | null
}

const OPEN_STATUSES = ['APPROVED', 'CONFIRMED']

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function downloadBase64(fileName: string, mimeType: string, base64: string): void {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([bytes], { type: mimeType }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * Acceptance letter (round 4): the rider's private link (copy / create), then once they
 * submit, every answer plus the private passport download. Confirming waits for this letter.
 */
export function AcceptancePanel({ applicationId, status, acceptanceUrl, acceptance, onLinkCreated }: AcceptancePanelProps) {
  const [ensureLink, { loading: isCreatingLink }] = useMutation<{ ensureAcceptanceLink: string }>(ENSURE_ACCEPTANCE_LINK)
  const [fetchPassport, { loading: isDownloading }] = useLazyQuery<PassportResult>(GET_ACCEPTANCE_PASSPORT, {
    fetchPolicy: 'network-only',
  })
  const [copied, setCopied] = useState(false)

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Acceptance link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy. Select the link and copy it manually.')
    }
  }

  const createLink = async () => {
    try {
      const result = await ensureLink({ variables: { applicationId } })
      if (result.data?.ensureAcceptanceLink) {
        toast.success('Acceptance link created')
        onLinkCreated()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the link')
    }
  }

  const downloadPassport = async () => {
    const result = await fetchPassport({ variables: { applicationId } })
    const file = result.data?.getAcceptancePassport
    if (!file) {
      toast.error('Could not download the passport copy')
      return
    }
    downloadBase64(file.fileName, file.mimeType, file.base64)
  }

  if (!OPEN_STATUSES.includes(status)) {
    return (
      <FormSection title="Acceptance letter" description="Sent to the rider once you approve the application">
        <p className="text-sm text-muted-foreground">Approve the application to create the rider&apos;s private acceptance-letter link.</p>
      </FormSection>
    )
  }

  const linkBlock = acceptanceUrl ? (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rider&apos;s private link</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="max-w-full break-all rounded bg-muted px-2 py-1 text-xs" data-acceptance-url>
          {acceptanceUrl}
        </code>
        <Button size="sm" variant="outline" onClick={() => copyLink(acceptanceUrl)}>
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy link'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Send this link to the rider. It is emailed automatically on approval once email sending is set up.
      </p>
    </div>
  ) : (
    <Button size="sm" variant="outline" onClick={createLink} disabled={isCreatingLink}>
      {isCreatingLink ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Link2 className="mr-1.5 h-3.5 w-3.5" />}
      Create acceptance link
    </Button>
  )

  if (!acceptance) {
    return (
      <FormSection title="Acceptance letter" description="Waiting for the rider">
        <p className="flex items-center gap-2 text-sm text-amber-600">
          <Clock className="h-4 w-4" /> Not received yet. Confirm becomes available once it arrives.
        </p>
        {linkBlock}
      </FormSection>
    )
  }

  return (
    <FormSection title="Acceptance letter" description={`Received ${formatDateTime(acceptance.submittedAt)}`}>
      <div data-acceptance-received className="space-y-4">
        <p className="flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-4 w-4" /> Commitment Letter and liability agreement accepted.
        </p>

        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          {acceptance.usePastPhotoAndBio ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">Reusing their past photo and bio.</p>
          ) : (
            <>
              {acceptance.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote rider photo preview
                <img src={acceptance.photoUrl} alt="Rider photo" className="h-40 w-32 rounded-md border object-cover" />
              )}
              <DetailField label="Bio" value={acceptance.bio && <span className="whitespace-pre-wrap">{acceptance.bio}</span>} />
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Name on letter" value={`${acceptance.firstName} ${acceptance.lastName}`} />
          <DetailField label="Email" value={acceptance.email} />
          <DetailField label="Shipping address" value={formatResponse(acceptance.shippingAddress)} />
          <DetailField label="T-shirt size" value={acceptance.tshirtSize} />
          <DetailField label="Dietary" value={acceptance.dietaryRestrictions} />
          <DetailField label="Rooming" value={roomingLabel(acceptance.roomingPreference)} />
          <DetailField label="Preferred roommate" value={acceptance.roommatePreference} />
          <DetailField label="Questions" value={acceptance.questions && <span className="whitespace-pre-wrap">{acceptance.questions}</span>} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {acceptance.hasPassport ? (
            <Button size="sm" variant="outline" onClick={downloadPassport} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
              Download passport copy{acceptance.passportFileName ? ` (${acceptance.passportFileName})` : ''}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">No passport copy attached.</span>
          )}
        </div>

        {linkBlock}
      </div>
    </FormSection>
  )
}
