'use client'

import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Plus, Package, ShoppingCart, Percent } from 'lucide-react'
import Link from 'next/link'
import { MerchProductsTable } from '@/features/merch/components/merch-products-table'
import { GET_MERCH_CATEGORIES, GET_MERCH_PRODUCTS } from '@/graphql/queries/merch'
import { PageHeader, StatBar } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import type { MerchProduct } from '@/features/merch/types'

interface GetMerchProductsData {
  getMerchProducts: MerchProduct[]
}

interface GetMerchCategoriesData {
  getMerchCategories: Array<{ id: string }>
}

const PRODUCTS_LIMIT = 500

export default function MerchPage() {
  const { data, loading, error, refetch } = useQuery<GetMerchProductsData>(GET_MERCH_PRODUCTS, {
    variables: { language: 'en', limit: PRODUCTS_LIMIT, offset: 0 },
  })
  const { data: categoriesData, loading: categoriesLoading } = useQuery<GetMerchCategoriesData>(
    GET_MERCH_CATEGORIES,
    { variables: { language: 'en' } }
  )

  const products = data?.getMerchProducts ?? []

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      sub: `${products.filter((p) => p.status === 'ACTIVE').length} active`,
    },
    { label: 'Featured', value: products.filter((p) => p.isFeatured).length, sub: 'On homepage' },
    { label: 'Categories', value: categoriesData?.getMerchCategories.length ?? 0 },
    {
      label: 'Inventory',
      value: products.reduce((sum, p) => sum + (p.inventory || 0), 0),
      sub: 'Items in stock',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchandise"
        description="Manage your products, categories, and inventory"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/merch/products/create">
                <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Create Product
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/merch/orders">
                <ShoppingCart className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/merch/categories">
                <Package className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Categories
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/merch/discounts">
                <Percent className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Discounts
              </Link>
            </Button>
          </div>
        }
      />

      <StatBar stats={stats} loading={loading || categoriesLoading} />

      {error ? (
        <QueryErrorState title="Couldn't load products" message={error.message} onRetry={() => void refetch()} />
      ) : (
        <MerchProductsTable products={products} loading={loading} />
      )}
    </div>
  )
}
