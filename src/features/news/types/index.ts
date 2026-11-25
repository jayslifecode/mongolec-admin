import type { StatusTone } from '@/lib/ui/status-tones'

export interface NewsCategory {
  id: string
  name: string
  slug: string
  color?: string | null
  icon?: string | null
}

export interface NewsArticle {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'breaking'
  category: NewsCategory | null
  byline?: string | null
  publishedAt: string | null
  scheduledAt?: string | null
  createdAt: string
  updatedAt: string
  views?: number
  isBreaking?: boolean
  isFeatured?: boolean
  /** @deprecated use isFeatured */
  featured?: boolean
  featuredImage?: string | null
}

export const priorityConfig = {
  breaking: { label: 'Breaking', tone: 'danger' },
  urgent: { label: 'Urgent', tone: 'warning' },
  high: { label: 'High', tone: 'neutral' },
  normal: { label: 'Normal', tone: 'neutral' },
  low: { label: 'Low', tone: 'neutral' },
} as const satisfies Record<NewsArticle['priority'], { label: string; tone: StatusTone }>

export const statusConfig = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
} as const satisfies Record<NewsArticle['status'], { label: string; tone: StatusTone }>

export interface NewsFilters {
  search?: string
  status?: string[]
  priority?: string[]
  category?: string[]
  language?: string
  featured?: boolean
  author?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
}

export interface NewsStats {
  total: number
  published: number
  breaking: number
  featured: number
  drafts: number
  scheduled: number
}

export interface NewsPageSearchParams {
  page?: string
  pageSize?: string
  search?: string
  status?: string[]
  priority?: string[]
  category?: string[]
}
