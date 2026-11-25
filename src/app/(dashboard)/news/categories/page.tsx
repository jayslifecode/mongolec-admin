'use client'

import { useQuery } from '@apollo/client/react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NewsCategoriesTable, type NewsCategoryRow } from '@/features/news/components/news-categories-table'
import { GET_NEWS_CATEGORIES } from '@/graphql/queries/news'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

export default function NewsCategoriesPage() {
  const { data, loading, error, refetch } = useQuery<{ getNewsCategories: NewsCategoryRow[] }>(GET_NEWS_CATEGORIES, {
    variables: { language: 'en' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Categories"
        description="Organize your news articles with categories"
        backHref="/news"
        actions={
          <Button asChild>
            <Link href="/news/categories/create">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Category
            </Link>
          </Button>
        }
      />
      {error ? (
        <QueryErrorState title="Couldn't load categories" message={error.message} onRetry={() => void refetch()} />
      ) : (
        <NewsCategoriesTable categories={data?.getNewsCategories ?? []} loading={loading} />
      )}
    </div>
  )
}
