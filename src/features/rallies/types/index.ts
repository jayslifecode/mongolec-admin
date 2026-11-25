import type { StatusTone } from '@/lib/ui/status-tones'

export interface Rally {
  id: string
  title: string | { en: string; mn: string }
  slug: string
  description?: string | { en: string; mn: string }
  startDate: string
  endDate: string
  location?: string | { en: string; mn: string }
  duration?: number
  targetAudience?: string | { en: string; mn: string }
  maxParticipants?: number
  currentParticipants?: number
  heroImage?: string
  heroVideo?: string
  /** "Photos by: …" credit under the gallery (round 4). */
  photoCredit?: string | null
  /** Amounts quoted in the acceptance letter (round 4). */
  acceptanceTerms?: unknown
  /** Upcoming: "Coming soon" card. Past: simple tile with no page until info arrives. */
  isPlaceholder?: boolean

  isRecruiting: boolean
  applicationDeadline?: string
  status: RallyStatus
  createdAt: string
  updatedAt: string
}

export type RallyStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export const rallyStatusConfig: Record<RallyStatus, { label: string; tone: StatusTone }> = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  UPCOMING: { label: 'Upcoming', tone: 'neutral' },
  ONGOING: { label: 'Ongoing', tone: 'primary' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
}
