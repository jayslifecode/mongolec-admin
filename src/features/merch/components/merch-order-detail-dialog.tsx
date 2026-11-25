'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { DetailField, StatusBadge } from '@/components/admin'
import { UPDATE_MERCH_ORDER_STATUS } from '@/graphql/mutations/merch-orders'
import {
  type MerchOrder,
  orderStatusConfig,
  ORDER_STATUS_OPTIONS,
  type MerchOrderStatus,
  paidPayment,
} from '../types/orders'

interface MerchOrderDetailDialogProps {
  order: MerchOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MerchOrderDetailDialog({
  order,
  open,
  onOpenChange,
}: MerchOrderDetailDialogProps) {
  const [updateStatus, { loading: isUpdating }] = useMutation(
    UPDATE_MERCH_ORDER_STATUS,
    {
      onCompleted: () => toast.success('Order status updated'),
      onError: (err) => toast.error(err.message || 'Failed to update status'),
      refetchQueries: ['GetMerchOrders'],
    }
  )

  // The status picked in this dialog, remembered per order so it never leaks onto another order.
  const [pending, setPending] = useState<{ orderId: string; status: MerchOrderStatus } | null>(null)

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    const status = newStatus as MerchOrderStatus
    setPending({ orderId: order.id, status })
    try {
      await updateStatus({ variables: { id: order.id, status } })
    } catch {
      // onError already showed the message; show the real status again.
      setPending(null)
    }
  }

  if (!order) return null

  const currentStatus = pending?.orderId === order.id ? pending.status : order.status
  const statusConf = orderStatusConfig[currentStatus]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Order #{order.orderNumber}
            <StatusBadge tone={statusConf.tone}>{statusConf.label}</StatusBadge>
          </DialogTitle>
          <DialogDescription>
            Placed by {order.customerName} on {new Date(order.createdAt).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* QPay payment details */}
          {(() => {
            const pay = paidPayment(order)
            if (!pay) return null
            const fmt = (n?: number | null) =>
              `${(n ?? 0).toLocaleString()} ${pay.currency || order.currency}`
            const rows: Array<[string, React.ReactNode]> = [
              ['Paid amount', fmt(pay.paidAmount ?? pay.amount)],
              ['QPay fee', fmt(pay.fee)],
              ['Bank / wallet', pay.paymentWallet || '—'],
              ['Type', pay.paymentType || '—'],
              ['Paid at', pay.paidAt ? new Date(pay.paidAt).toLocaleString() : '—'],
              [
                'QPay payment id',
                <span key="pid" className="font-mono">
                  {pay.qpayPaymentId || '—'}
                </span>,
              ],
            ]
            if (pay.ebarimtCustomerNo) rows.push(['E-barimt no.', pay.ebarimtCustomerNo])
            return (
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Paid via QPay</p>
                  {pay.settlementStatus && (
                    <StatusBadge tone="success">{pay.settlementStatus}</StatusBadge>
                  )}
                </div>
                <div className="flex items-baseline gap-2 border-b border-border pb-2">
                  <span className="text-xs text-muted-foreground">Net received</span>
                  <span className="text-lg font-bold">{fmt(pay.netAmount)}</span>
                </div>
                <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
                  {rows.map(([label, value]) => (
                    <div key={label} className="flex flex-col">
                      <span className="text-muted-foreground">{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Status update */}
          <div className="space-y-2">
            <Label htmlFor="order-status">Update status</Label>
            <div className="flex items-center gap-2">
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger id="order-status" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {orderStatusConfig[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Saving" />}
            </div>
          </div>

          <Separator />

          {/* Contact info */}
          <div>
            <p className="text-sm font-semibold mb-3">Customer Information</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailField label="Name" value={order.customerName} />
              <DetailField label="Phone" value={order.phone} />
              <DetailField label="Email" value={order.email} />
              <DetailField label="Payment Method" value={order.paymentMethod} />
              <DetailField
                label="Delivery Method"
                value={
                  order.deliveryMethod === 'PICKUP'
                    ? 'Pickup'
                    : 'Delivery'
                }
              />
            </div>
          </div>

          {order.address && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-3">Delivery Address</p>
                <p className="text-sm text-foreground">{order.address}</p>
              </div>
            </>
          )}

          {order.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-semibold mb-1">Notes</p>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Line items */}
          <div>
            <p className="text-sm font-semibold mb-3">Items</p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-sm">
                    <span className="text-muted-foreground">×{item.quantity}</span>
                    <span className="font-medium tabular-nums">
                      {order.currency} {(item.unitPrice * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{order.currency} {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{order.currency} {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
