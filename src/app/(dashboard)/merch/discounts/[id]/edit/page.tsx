'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchDiscountForm } from '@/features/merch/components/merch-discount-form'
import { GET_MERCH_DISCOUNT_BY_ID } from '@/graphql/queries/merch'
import { AlertCircle, Package } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageHeader, EmptyState } from '@/components/admin'

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

  const { data, loading, error } = useQuery<GetMerchDiscountByIdData>(
    GET_MERCH_DISCOUNT_BY_ID,
    {
      variables: { id: discountId },
      skip: !discountId,
    }
  )

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState icon={Package} title="Loading discount…" className="py-20" />
      </div>
    )
  }

  if (error || !data?.getMerchDiscountById) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <PageHeader title="Edit Discount" backHref="/merch/discounts" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Discount not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const discount = data.getMerchDiscountById

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Edit Discount"
        description="Update discount information"
        backHref="/merch/discounts"
      />
      <MerchDiscountForm
        mode="edit"
        discountId={discountId}
        initialData={discount}
      />
    </div>
  )
}
