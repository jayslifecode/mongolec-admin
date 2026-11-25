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
