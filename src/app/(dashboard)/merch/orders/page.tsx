'use client'

import { useQuery } from '@apollo/client/react'
import { MerchOrdersTable } from '@/features/merch/components/merch-orders-table'
import { OrdersExportButton } from '@/features/merch/components/orders-export-button'
import { GET_MERCH_ORDERS } from '@/graphql/queries/merch-orders'
import { PageHeader, StatBar } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import type { MerchOrder } from '@/features/merch/types/orders'

interface GetMerchOrdersData {
  getMerchOrders: MerchOrder[]
}

const ORDERS_LIMIT = 500

export default function MerchOrdersPage() {
  const { data, loading, error, refetch } = useQuery<GetMerchOrdersData>(GET_MERCH_ORDERS, {
    variables: { limit: ORDERS_LIMIT, offset: 0 },
  })

  const orders = data?.getMerchOrders ?? []

  const awaiting = orders.filter((o) => o.status === 'AWAITING_PAYMENT' || o.status === 'PENDING').length
  const shipped = orders.filter((o) => o.status === 'SHIPPED').length
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length

  const stats = [
    { label: 'Total Orders', value: orders.length },
    { label: 'Awaiting payment', value: awaiting },
    { label: 'Shipped', value: shipped },
    { label: 'Delivered', value: delivered },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        description="View and manage merchandise orders"
        backHref="/merch"
        actions={<OrdersExportButton orders={orders} />}
      />

      <StatBar stats={stats} loading={loading} />

      {error ? (
        <QueryErrorState title="Couldn't load orders" message={error.message} onRetry={() => void refetch()} />
      ) : (
        <MerchOrdersTable orders={orders} loading={loading} />
      )}
    </div>
  )
}
