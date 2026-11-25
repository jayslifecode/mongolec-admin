import type { StatusTone } from '@/lib/ui/status-tones'

export interface Nomination {
  id: string
  country: string
  parkNames: string | { en: string; mn: string }
  parkWebsites?: string | { en: string; mn: string }
  parkContactFirstName?: string
  parkContactLastName?: string
  parkContactEmail?: string
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
  status: NominationStatus
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
}

export type NominationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SELECTED'
  | 'NOT_SELECTED'

export interface NominationStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  selected: number
  notSelected: number
}

export const nominationStatusConfig: Record<NominationStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'neutral' },
  APPROVED: { label: 'Approved', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  SELECTED: { label: 'Selected for Rally', tone: 'primary' },
  NOT_SELECTED: { label: 'Not Selected', tone: 'neutral' },
}
