'use client'

import { useQuery } from '@apollo/client/react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MerchCategoriesTable } from '@/features/merch/components/merch-categories-table'
import { GET_MERCH_CATEGORIES } from '@/graphql/queries/merch'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

interface CategoryData {
  getMerchCategories: Array<{
    id: string
    name: string
    slug: string
    description?: string | null
    createdAt: string
    updatedAt: string
  }>
}

export default function MerchCategoriesPage() {
  const { data, loading, error, refetch } = useQuery<CategoryData>(GET_MERCH_CATEGORIES, {
    variables: { language: 'en' },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise Categories"
        description="Organize your products with categories"
        backHref="/merch"
        actions={
          <Button asChild>
            <Link href="/merch/categories/create">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create Category
            </Link>
          </Button>
        }
      />
      {error ? (
        <QueryErrorState title="Couldn't load categories" message={error.message} onRetry={() => void refetch()} />
      ) : (
        <MerchCategoriesTable categories={data?.getMerchCategories ?? []} loading={loading} />
      )}
    </div>
  )
}
