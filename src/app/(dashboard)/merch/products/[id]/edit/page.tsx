'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchProductForm } from '@/features/merch/components/merch-product-form'
import { GET_MERCH_PRODUCT_BY_ID, GET_MERCH_PRODUCT_MN } from '@/graphql/queries/merch'
import { mergeLocalized } from '@/features/merch/lib/localized'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import type { MerchProduct } from '@/features/merch/types'

interface ProductData {
  getMerchProductById: (MerchProduct & { name: string; description?: string; shortDescription?: string }) | null
}

interface ProductMnData {
  getMerchProductById: { name?: string; description?: string; shortDescription?: string } | null
}

export default function MerchProductEditPage() {
  const params = useParams()
  const productId = params.id as string
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  // The API returns one language per request. Fetch both so saving never overwrites the other language.
  const en = useQuery<ProductData>(GET_MERCH_PRODUCT_BY_ID, {
    variables: { id: productId, language: 'en' },
    skip: !productId,
  })
  const mn = useQuery<ProductMnData>(GET_MERCH_PRODUCT_MN, {
    variables: { id: productId },
    skip: !productId,
  })

  const enProduct = en.data?.getMerchProductById
  const mnProduct = mn.data?.getMerchProductById
  const product = useMemo<MerchProduct | null>(() => {
    if (!enProduct) return null
    return {
      ...enProduct,
      name: mergeLocalized(enProduct.name, mnProduct?.name),
      description: mergeLocalized(enProduct.description, mnProduct?.description),
      shortDescription: mergeLocalized(enProduct.shortDescription, mnProduct?.shortDescription),
    }
  }, [enProduct, mnProduct])

  const loading = en.loading || mn.loading
  const error = en.error ?? mn.error
  const title = enProduct?.name || 'Edit Product'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={title}
        description="Update product information and settings"
        backHref="/merch"
        lang={language}
        onLangChange={setLanguage}
      />
      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading product">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error || !product ? (
        <QueryErrorState
          title={error ? "Couldn't load this product" : 'Product not found'}
          message={error?.message ?? 'It may have been deleted.'}
          onRetry={error ? () => void Promise.all([en.refetch(), mn.refetch()]) : undefined}
        />
      ) : (
        <MerchProductForm
          mode="edit"
          language={language}
          onLanguageChange={setLanguage}
          productId={productId}
          initialData={product}
        />
      )}
    </div>
  )
}
