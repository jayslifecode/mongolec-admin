import type { StatusTone } from '@/lib/ui/status-tones'

export interface MerchProduct {
  id: string
  name: string | { en: string; mn: string }
  slug: string
  sku: string
  description?: string | { en: string; mn: string }
  shortDescription?: string | { en: string; mn: string }
  price: number
  compareAtPrice?: number
  currency: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED'
  category?: MerchCategory
  featuredImage?: string
  images?: string[]
  inventory: number
  trackInventory: boolean
  minStock?: number
  isFeatured: boolean
  hasVariants?: boolean
  options?: any[]
  variants?: MerchVariant[]
  createdAt: string
  updatedAt: string
}

export interface MerchVariant {
  id: string
  sku: string
  title?: string
  price: number
  compareAtPrice?: number
  inventory: number
  image?: string
  isAvailable: boolean
  optionValues?: any[]
}

export type MerchDiscountType = 'PERCENT' | 'AMOUNT'

export interface MerchDiscount {
  id: string
  name: string
  type: MerchDiscountType
  value: number
  startDate: string
  endDate: string
  isActive: boolean
  productIds: string[]
  createdAt: string
  updatedAt: string
}

export interface MerchCategory {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  parentId?: string
  productCount: number
  createdAt: string
  updatedAt: string
}

export const merchStatusConfig = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
  OUT_OF_STOCK: { label: 'Out of Stock', tone: 'danger' },
  DISCONTINUED: { label: 'Discontinued', tone: 'neutral' },
} as const satisfies Record<MerchProduct['status'], { label: string; tone: StatusTone }>

export type StockLevel = 'in' | 'low' | 'out'

/** Stock tones: In stock success, Low stock warning, Out of stock danger. */
export const stockLevelConfig = {
  in: { label: 'In stock', tone: 'success' },
  low: { label: 'Low stock', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'danger' },
} as const satisfies Record<StockLevel, { label: string; tone: StatusTone }>

export const LOW_STOCK_THRESHOLD = 10

export function getStockLevel(inventory: number, minStock?: number | null): StockLevel {
  if (inventory <= 0) return 'out'
  const threshold = minStock && minStock > 0 ? minStock : LOW_STOCK_THRESHOLD
  return inventory <= threshold ? 'low' : 'in'
}
