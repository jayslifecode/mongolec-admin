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

export const rallyStatusConfig = {
  DRAFT: {
    label: 'Draft',
    color: 'bg-gray-200 text-gray-800 border-gray-300',
    variant: 'outline' as const,
  },
  UPCOMING: {
    label: 'Upcoming',
    color: 'bg-blue-500 text-white border-blue-500',
    variant: 'default' as const,
  },
  ONGOING: {
    label: 'Ongoing',
    color: 'bg-green-500 text-white border-green-500',
    variant: 'default' as const,
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-purple-500 text-white border-purple-500',
    variant: 'secondary' as const,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-500 text-white border-red-500',
    variant: 'destructive' as const,
  },
} as const
