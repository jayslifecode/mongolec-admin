'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { StatusBadge } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import { MerchOrderDetailDialog } from './merch-order-detail-dialog'
import { type MerchOrder, orderStatusConfig } from '../types/orders'

function buildColumns(
  onViewClick: (order: MerchOrder) => void
): ColumnDef<MerchOrder>[] {
  return [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">
          #{row.original.orderNumber}
        </span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-medium text-sm">{order.customerName}</div>
            {order.phone && (
              <div className="text-xs text-muted-foreground">{order.phone}</div>
            )}
          </div>
        )
      },
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) => {
        const order = row.original
        return (
          <span className="font-medium tabular-nums text-sm">
            <span className="text-xs text-muted-foreground mr-0.5">
              {order.currency}
            </span>
            {order.total.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const order = row.original
        const conf = orderStatusConfig[order.status]
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge tone={conf?.tone ?? 'neutral'}>{conf?.label ?? order.status}</StatusBadge>
              {order.paymentClaimedAt && <StatusBadge tone="success">Payment claimed</StatusBadge>}
            </div>
            <span className="text-xs text-muted-foreground">
              {order.deliveryMethod === 'PICKUP' ? 'Pickup' : 'Delivery'}
            </span>
          </div>
        )
      },
    },
    createCreatedAtColumn<MerchOrder>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`View order ${row.original.orderNumber}`}
          onClick={() => onViewClick(row.original)}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Button>
      ),
    },
  ]
}

interface MerchOrdersTableProps {
  orders: MerchOrder[]
  loading?: boolean
}

export function MerchOrdersTable({ orders, loading }: MerchOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<MerchOrder | null>(null)

  const columns = buildColumns(setSelectedOrder)

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No orders found."
        toolbarConfig={{ searchPlaceholder: 'Search orders…' }}
      />
      <MerchOrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null)
        }}
      />
    </>
  )
}
