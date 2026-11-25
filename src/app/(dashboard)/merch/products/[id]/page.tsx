'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchProductForm } from '@/features/merch/components/merch-product-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_MERCH_PRODUCT_BY_ID } from '@/graphql/queries/merch'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import type { MerchProduct } from '@/features/merch/types'

interface GetMerchProductByIdData {
  getMerchProductById: MerchProduct | null
}

export default function MerchProductViewPage() {
  const params = useParams()
  const productId = params.id as string
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  const { data, loading, error, refetch } = useQuery<GetMerchProductByIdData>(GET_MERCH_PRODUCT_BY_ID, {
    variables: { id: productId, language },
    skip: !productId,
  })

  const product = data?.getMerchProductById

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="View Product"
        description="Product details (read-only)"
        backHref="/merch"
        lang={language}
        onLangChange={setLanguage}
        actions={
          <Button asChild>
            <Link href={`/merch/products/${productId}/edit`}>
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Edit Product
            </Link>
          </Button>
        }
      />
      {/* Keep showing the product while the other language loads. */}
      {loading && !product ? (
        <div className="space-y-4" role="status" aria-label="Loading product">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error || !product ? (
        <QueryErrorState
          title={error ? "Couldn't load this product" : 'Product not found'}
          message={error?.message ?? 'It may have been deleted.'}
          onRetry={error ? () => void refetch() : undefined}
        />
      ) : (
        <MerchProductForm mode="view" language={language} productId={productId} initialData={product} />
      )}
    </div>
  )
}
