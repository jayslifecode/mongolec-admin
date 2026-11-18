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

export const applicationStatusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-200 text-yellow-800 border-yellow-300',
    variant: 'outline' as const,
    icon: 'Clock',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    color: 'bg-blue-200 text-blue-800 border-blue-300',
    variant: 'outline' as const,
    icon: 'FileText',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-500 text-white border-green-500',
    variant: 'default' as const,
    icon: 'Check',
  },
  WAITLIST: {
    label: 'Waitlisted',
    color: 'bg-orange-200 text-orange-800 border-orange-300',
    variant: 'outline' as const,
    icon: 'Clock',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-500 text-white border-red-500',
    variant: 'destructive' as const,
    icon: 'X',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-200 text-gray-800 border-gray-300',
    variant: 'outline' as const,
    icon: 'X',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-purple-500 text-white border-purple-500',
    variant: 'default' as const,
    icon: 'Check',
  },
} as const

export const paymentStatusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-gray-200 text-gray-800 border-gray-300',
    variant: 'outline' as const,
  },
  DEPOSIT_PAID: {
    label: 'Deposit Paid',
    color: 'bg-blue-500 text-white border-blue-500',
    variant: 'default' as const,
  },
  FULLY_PAID: {
    label: 'Fully Paid',
    color: 'bg-green-500 text-white border-green-500',
    variant: 'default' as const,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-red-200 text-red-800 border-red-300',
    variant: 'outline' as const,
  },
} as const
