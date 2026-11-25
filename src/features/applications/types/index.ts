import type { StatusTone } from '@/lib/ui/status-tones'

export interface Application {
  id: string
  userId: string
  rallyId: string
  rally?: {
    id: string
    title: string | { en: string; mn: string }
    slug: string
    startDate: string
    endDate: string
    location?: string | { en: string; mn: string }
    maxParticipants?: number
    currentParticipants?: number
  }
  status: ApplicationStatus
  paymentStatus: PaymentStatus
  isRider: boolean
  hasMotorcycleLicense: boolean
  ridingExperience?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  address?: string
  birthdate?: string
  isMedicalProfessional: boolean
  medicalConditions?: string
  dietaryRestrictions?: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactEmail: string
  emergencyContactRelationship: string
  motivation?: string
  travelExperience?: string
  futureLocations?: string
  depositPaid: boolean
  depositAmount?: number
  totalAmount?: number
  fundraisingGoal?: number
  fundraisingRaised?: number
  reviewNotes?: unknown
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  /** Present once the rider has submitted their acceptance letter (round 4). */
  acceptance?: { id: string; submittedAt: string } | null
}

export type ApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'WAITLIST'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CONFIRMED'

export type PaymentStatus = 'PENDING' | 'DEPOSIT_PAID' | 'FULLY_PAID' | 'REFUNDED'

export interface ApplicationStats {
  total: number
  pending: number
  underReview: number
  approved: number
  waitlisted: number
  rejected: number
  cancelled: number
  confirmed: number
}

export const applicationStatusConfig: Record<ApplicationStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', tone: 'neutral' },
  APPROVED: { label: 'Approved', tone: 'success' },
  WAITLIST: { label: 'Waitlisted', tone: 'warning' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
  CONFIRMED: { label: 'Confirmed', tone: 'primary' },
}

export const paymentStatusConfig: Record<PaymentStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pending', tone: 'neutral' },
  DEPOSIT_PAID: { label: 'Deposit Paid', tone: 'warning' },
  FULLY_PAID: { label: 'Fully Paid', tone: 'success' },
  REFUNDED: { label: 'Refunded', tone: 'neutral' },
}
