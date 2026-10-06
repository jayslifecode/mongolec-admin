export type RiderTier = 'RIDER' | 'RETURNING' | 'VETERAN' | 'LEGEND'

export interface ParticipantRallyLink {
  rally: {
    id: string
    slug: string
    title: string
    startDate: string
  }
  year?: number | null
  role?: string | null
}

export interface ParticipantProfile {
  id: string
  firstName: string
  lastName: string
  photo?: string
  country: string
  bio?: string
  isActive: boolean
  displayOrder: number
  slug: string
  honoraryTitle?: string | null
  rallyCount: number
  tier: RiderTier
  rallies: ParticipantRallyLink[]
  createdAt: string
  updatedAt: string
}

export const riderTierConfig: Record<RiderTier, { label: string; className: string }> = {
  RIDER: {
    label: 'Rider',
    className: 'bg-slate-100 text-slate-700',
  },
  RETURNING: {
    label: 'Returning',
    className: 'bg-sky-100 text-sky-700',
  },
  VETERAN: {
    label: 'Veteran',
    className: 'bg-violet-100 text-violet-700',
  },
  LEGEND: {
    label: 'Legend',
    className: 'bg-amber-100 text-amber-700',
  },
}
