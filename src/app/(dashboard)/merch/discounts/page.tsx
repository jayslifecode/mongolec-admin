'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { MerchDiscountsTable } from '@/features/merch/components/merch-discounts-table'
import { GET_MERCH_DISCOUNTS } from '@/graphql/queries/merch'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import type { MerchDiscount } from '@/features/merch/types'

interface GetMerchDiscountsData {
  getMerchDiscounts: MerchDiscount[]
}

// Admin pages are auth-gated and query the API on render; never prerender them at build.
export const dynamic = 'force-dynamic'

export default function MerchDiscountsPage() {
  const { data, loading, error, refetch } = useQuery<GetMerchDiscountsData>(GET_MERCH_DISCOUNTS, {
    variables: { limit: 100, offset: 0 },
  })

  const discounts = data?.getMerchDiscounts ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discounts"
        description="Manage discounts and promotional pricing"
        backHref="/merch"
        actions={
          <Button asChild>
            <Link href="/merch/discounts/create">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Create Discount
            </Link>
          </Button>
        }
      />

      {error ? (
        <QueryErrorState title="Couldn't load discounts" message={error.message} onRetry={() => void refetch()} />
      ) : (
        <MerchDiscountsTable discounts={discounts} loading={loading} />
      )}
    </div>
  )
}
