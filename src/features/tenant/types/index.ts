import type { StatusTone } from '@/lib/ui/status-tones'

export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'ARCHIVED'
export type TenantPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'

export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  isActive: boolean
  status: TenantStatus
  plan: TenantPlan
  createdAt: string
  updatedAt: string
}

export interface CreateTenantInput {
  name: string
  slug: string
  domain?: string
  isActive?: boolean
  status?: TenantStatus
  plan?: TenantPlan
}

export interface UpdateTenantInput {
  name?: string
  slug?: string
  domain?: string
  isActive?: boolean
  status?: TenantStatus
  plan?: TenantPlan
}

export const tenantStatusConfig = {
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
  PENDING: { label: 'Pending', tone: 'warning' },
  ARCHIVED: { label: 'Archived', tone: 'neutral' },
} as const satisfies Record<TenantStatus, { label: string; tone: StatusTone }>

export const tenantPlanConfig = {
  FREE: { label: 'Free', tone: 'neutral' },
  BASIC: { label: 'Basic', tone: 'neutral' },
  PRO: { label: 'Pro', tone: 'neutral' },
  ENTERPRISE: { label: 'Enterprise', tone: 'neutral' },
} as const satisfies Record<TenantPlan, { label: string; tone: StatusTone }>
