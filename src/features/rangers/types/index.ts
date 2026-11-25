export interface ParkPartnership {
  id: string
  parkName: string | { en: string; mn: string }
  country: string
  location: string | { en: string; mn: string }
  establishedDate?: string
  partnershipType: string | { en: string; mn: string }
  rangersCount?: number
  areaSize?: string | { en: string; mn: string }
  keyChallenges?: string | { en: string; mn: string }
  contactPerson?: string
  contactEmail?: string
  contactPhone?: string
  photos?: string | string[]
  videos?: string | string[]
  rallies?: string | string[]
  status: PartnershipStatus
  createdAt: string
  updatedAt: string
}

export type PartnershipStatus = 'PROPOSED' | 'ACTIVE' | 'INACTIVE' | 'HISTORICAL'

export const partnershipStatusConfig: Record<
  PartnershipStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
  PROPOSED: { label: 'Proposed', tone: 'warning' },
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
  HISTORICAL: { label: 'Historical', tone: 'neutral' },
}
