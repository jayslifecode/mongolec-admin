'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { MerchDiscountsTable } from '@/features/merch/components/merch-discounts-table'
import { GET_MERCH_DISCOUNTS } from '@/graphql/queries/merch'
import { PageHeader, EmptyState } from '@/components/admin'
import { Package } from 'lucide-react'

interface GetMerchDiscountsData {
  getMerchDiscounts: any[]
}

// Admin pages are auth-gated and query the API on render; never prerender them at build.
export const dynamic = 'force-dynamic'

export default function MerchDiscountsPage() {
  const { data, loading, error } = useQuery<GetMerchDiscountsData>(GET_MERCH_DISCOUNTS, {
    variables: { limit: 100, offset: 0 },
  })

  const discounts = data?.getMerchDiscounts ?? []

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="Discounts"
        description="Manage discounts and promotional pricing"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/merch">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Merch
              </Link>
            </Button>
            <Button asChild>
              <Link href="/merch/discounts/create">
                <Plus className="h-4 w-4 mr-1.5" />
                Create Discount
              </Link>
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load discounts: {error.message}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <EmptyState icon={Package} title="Loading discounts…" className="py-20" />
      ) : (
        <MerchDiscountsTable discounts={discounts} />
      )}
    </div>
  )
}
