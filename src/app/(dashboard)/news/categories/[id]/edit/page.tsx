'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client/react'
import { NewsCategoryForm } from '@/features/news/components/news-category-form'
import { GET_NEWS_CATEGORY_BY_ID, GET_NEWS_CATEGORY_MN } from '@/graphql/queries/news'
import { mergeLocalized } from '@/features/merch/lib/localized'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

interface CategoryData {
  getNewsCategoryById: {
    id: string
    name?: string
    slug?: string
    description?: string | null
    color?: string | null
  } | null
}

export default function NewsCategoryEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // The API returns one language per request. Fetch both so saving never overwrites the other language.
  const en = useQuery<CategoryData>(GET_NEWS_CATEGORY_BY_ID, { variables: { id, language: 'en' } })
  const mn = useQuery<CategoryData>(GET_NEWS_CATEGORY_MN, { variables: { id } })

  const loading = en.loading || mn.loading
  const error = en.error ?? mn.error
  const enCategory = en.data?.getNewsCategoryById
  const mnCategory = mn.data?.getNewsCategoryById
  const category = enCategory
    ? {
        id: enCategory.id,
        slug: enCategory.slug,
        color: enCategory.color,
        name: mergeLocalized(enCategory.name, mnCategory?.name),
        description: mergeLocalized(enCategory.description, mnCategory?.description),
      }
    : null

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Edit News Category" description="Update category information" backHref="/news/categories" />
      {loading ? (
        <Skeleton className="h-80 w-full" role="status" aria-label="Loading category" />
      ) : error || !category ? (
        <QueryErrorState
          title={error ? "Couldn't load this category" : 'Category not found'}
          message={error?.message ?? 'It may have been deleted.'}
          onRetry={error ? () => void Promise.all([en.refetch(), mn.refetch()]) : undefined}
        />
      ) : (
        <NewsCategoryForm mode="edit" categoryId={id} initialData={category} />
      )}
    </div>
  )
}
