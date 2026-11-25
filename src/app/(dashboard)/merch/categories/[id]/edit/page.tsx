'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { MerchCategoryForm } from '@/features/merch/components/merch-category-form'
import { GET_MERCH_CATEGORY_BY_ID, GET_MERCH_CATEGORY_MN } from '@/graphql/queries/merch'
import { mergeLocalized } from '@/features/merch/lib/localized'
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

  // The API returns one language per request. Fetch both so saving never overwrites the other language.
  const en = useQuery<GetMerchCategoryByIdData>(GET_MERCH_CATEGORY_BY_ID, {
    variables: { id: categoryId, language: 'en' },
    skip: !categoryId,
  })
  const mn = useQuery<GetMerchCategoryByIdData>(GET_MERCH_CATEGORY_MN, {
    variables: { id: categoryId },
    skip: !categoryId,
  })
  const loading = en.loading || mn.loading
  const error = en.error ?? mn.error
  const enCategory = en.data?.getMerchCategoryById
  const mnCategory = mn.data?.getMerchCategoryById
  const category = enCategory
    ? {
        ...enCategory,
        name: mergeLocalized(enCategory.name as string, mnCategory?.name as string | undefined),
        description: mergeLocalized(enCategory.description as string | undefined, mnCategory?.description as string | undefined),
      }
    : null
  const refetch = () => Promise.all([en.refetch(), mn.refetch()])

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
