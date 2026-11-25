'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchCategoryForm } from '@/features/merch/components/merch-category-form'
import { GET_MERCH_CATEGORY_BY_ID } from '@/graphql/queries/merch'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

interface GetMerchCategoryByIdData {
  getMerchCategoryById: {
    id: string
    name: string | { en?: string; mn?: string }
    slug: string
    description?: string | { en?: string; mn?: string }
  } | null
}

export default function MerchCategoryEditPage() {
  const params = useParams()
  const categoryId = params.id as string

  const { data, loading, error, refetch } = useQuery<GetMerchCategoryByIdData>(GET_MERCH_CATEGORY_BY_ID, {
    variables: { id: categoryId },
    skip: !categoryId,
  })
  const category = data?.getMerchCategoryById

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Edit Category" description="Update category information" backHref="/merch/categories" />
      {loading ? (
        <Skeleton className="h-80 w-full" role="status" aria-label="Loading category" />
      ) : error || !category ? (
        <QueryErrorState
          title={error ? "Couldn't load this category" : 'Category not found'}
          message={error?.message ?? 'It may have been deleted.'}
          onRetry={error ? () => void refetch() : undefined}
        />
      ) : (
        <MerchCategoryForm mode="edit" categoryId={categoryId} initialData={category} />
      )}
    </div>
  )
}
