'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchDiscountForm } from '@/features/merch/components/merch-discount-form'
import { GET_MERCH_DISCOUNT_BY_ID } from '@/graphql/queries/merch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

interface GetMerchDiscountByIdData {
  getMerchDiscountById: {
    id: string
    name: string
    type: 'PERCENT' | 'AMOUNT'
    value: number
    startDate: string
    endDate: string
    isActive: boolean
    productIds: string[]
  } | null
}

// Admin pages are auth-gated and query the API on render; never prerender them at build.
export const dynamic = 'force-dynamic'

export default function MerchDiscountEditPage() {
  const params = useParams()
  const discountId = params.id as string

  const { data, loading, error, refetch } = useQuery<GetMerchDiscountByIdData>(
    GET_MERCH_DISCOUNT_BY_ID,
    {
      variables: { id: discountId },
      skip: !discountId,
    }
  )

  const discount = data?.getMerchDiscountById

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Edit Discount"
        description="Update discount information"
        backHref="/merch/discounts"
      />
      {loading ? (
        <Skeleton className="h-96 w-full" role="status" aria-label="Loading discount" />
      ) : error || !discount ? (
        <QueryErrorState
          title={error ? "Couldn't load this discount" : 'Discount not found'}
          message={error?.message ?? 'It may have been deleted.'}
          onRetry={error ? () => void refetch() : undefined}
        />
      ) : (
        <MerchDiscountForm mode="edit" discountId={discountId} initialData={discount} />
      )}
    </div>
  )
}
