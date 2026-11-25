import type { StatusTone } from '@/lib/ui/status-tones'

export type MerchOrderStatus =
  | 'AWAITING_PAYMENT'
  | 'PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'EXPIRED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED'

export interface MerchOrderItem {
  id: string
  productId: string
  name: string
  image?: string
  variantId?: string
  variantName?: string
  unitPrice: number
  quantity: number
}

export interface MerchPayment {
  id: string
  provider: string
  status: PaymentStatus
  amount: number
  paidAmount?: number | null
  fee?: number | null
  netAmount?: number | null
  paymentWallet?: string | null
  paymentType?: string | null
  settlementStatus?: string | null
  ebarimtCustomerNo?: string | null
  currency: string
  qpayInvoiceId?: string | null
  qpayPaymentId?: string | null
  paidAt?: string | null
  createdAt: string
}

export interface MerchOrder {
  id: string
  orderNumber: string
  userId?: string
  customerName: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  status: MerchOrderStatus
  paymentMethod?: string
  subtotal: number
  total: number
  currency: string
  tenantId?: string
  items: MerchOrderItem[]
  payments?: MerchPayment[]
  deliveryMethod: string
  paymentClaimedAt?: string | null
  createdAt: string
  updatedAt: string
}

export const orderStatusConfig: Record<MerchOrderStatus, { label: string; tone: StatusTone }> = {
  AWAITING_PAYMENT: { label: 'Awaiting payment', tone: 'warning' },
  PENDING: { label: 'Pending', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
  CONFIRMED: { label: 'Confirmed', tone: 'neutral' },
  SHIPPED: { label: 'Shipped', tone: 'neutral' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
}

export const paymentStatusConfig: Record<PaymentStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pending', tone: 'warning' },
  PAID: { label: 'Paid', tone: 'success' },
  FAILED: { label: 'Failed', tone: 'danger' },
  EXPIRED: { label: 'Expired', tone: 'neutral' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
}

/** The paid QPay payment for an order, if any. */
export function paidPayment(order: MerchOrder): MerchPayment | undefined {
  return order.payments?.find((p) => p.status === 'PAID')
}

export const ORDER_STATUS_OPTIONS: MerchOrderStatus[] = [
  'AWAITING_PAYMENT',
  'PAID',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'EXPIRED',
]
