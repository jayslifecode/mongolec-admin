import { Metadata } from 'next'
import { MerchDiscountForm } from '@/features/merch/components/merch-discount-form'
import { PageHeader } from '@/components/admin'

// Admin pages are auth-gated and query the API on render; never prerender them at build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Create Discount',
  description: 'Create a new merchandise discount',
}

export default function CreateMerchDiscountPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Create Discount"
        description="Create a discount to apply to your products"
        backHref="/merch/discounts"
      />
      <MerchDiscountForm mode="create" />
    </div>
  )
}
