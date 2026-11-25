'use client'

import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'
import { Edit, Trash2, MoreHorizontal, Package, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { StatusBadge } from '@/components/admin'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { StatusTone } from '@/lib/ui/status-tones'
import { DELETE_MERCH_PRODUCT } from '@/graphql/mutations/merch'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, createActionsColumn, createCreatedAtColumn } from '@/components/data-table'
import type { MerchProduct } from '../types'
import { getStockLevel, merchStatusConfig, stockLevelConfig } from '../types'

function getDisplayName(field: string | { en: string; mn: string } | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

function getTotalInventory(product: MerchProduct): number {
  if (product.hasVariants && product.variants?.length) {
    return product.variants.reduce((sum, v) => sum + (v.inventory || 0), 0)
  }
  return product.inventory || 0
}

function getPriceDisplay(product: MerchProduct): string {
  if (product.hasVariants && product.variants?.length) {
    const prices = product.variants.map(v => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `${min.toLocaleString()}`
    return `${min.toLocaleString()} – ${max.toLocaleString()}`
  }
  return `${product.price.toLocaleString()}`
}

function ActionsCell({
  product,
  onDelete,
}: {
  product: MerchProduct
  onDelete: (product: MerchProduct) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Actions for ${getDisplayName(product.name) || 'product'}`}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/merch/products/${product.id}`}>
            <Package className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/merch/products/${product.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(product)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDelete: (product: MerchProduct) => void): ColumnDef<MerchProduct>[] {
  return [
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original
      const name = getDisplayName(product.name)
      return (
        <div className="flex items-center gap-3">
          {product.featuredImage ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-muted flex-shrink-0">
              <Image
                src={product.featuredImage}
                alt={name || 'Product'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted border flex-shrink-0">
              <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium truncate">
              {name || <span className="text-muted-foreground italic">Untitled Product</span>}
            </div>
            {product.sku && (
              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const product = row.original
      const conf = merchStatusConfig[product.status] as { label: string; tone: StatusTone } | undefined
      return (
        <StatusBadge tone={conf?.tone ?? 'neutral'}>
          {conf?.label ?? product.status}
          {product.isFeatured && (
            <>
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              <span className="sr-only">Featured</span>
            </>
          )}
        </StatusBadge>
      )
    },
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div>
          <div className="font-medium">
            <span className="text-xs text-muted-foreground mr-0.5">{product.currency}</span>
            {getPriceDisplay(product)}
          </div>
          {product.compareAtPrice && !product.hasVariants && (
            <div className="text-xs text-muted-foreground line-through">
              {product.currency} {product.compareAtPrice.toLocaleString()}
            </div>
          )}
        </div>
      )
    },
  },
  {
    id: 'inventory',
    header: 'Stock',
    cell: ({ row }) => {
      const product = row.original
      const total = getTotalInventory(product)
      const stock = stockLevelConfig[getStockLevel(total, product.minStock)]
      const variantCount = product.hasVariants ? (product.variants?.length ?? 0) : 0
      const stockBadge = (
        <StatusBadge tone={stock.tone} className="mt-1">
          {stock.label}
        </StatusBadge>
      )

      return (
        <div>
          <div className="font-medium text-sm">{total}</div>
          {variantCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {variantCount} variant{variantCount !== 1 ? 's' : ''}
            </div>
          )}
          {stockBadge}
        </div>
      )
    },
  },
  createCreatedAtColumn<MerchProduct>(),
  createActionsColumn<MerchProduct>(({ row }) => <ActionsCell product={row.original} onDelete={onDelete} />),
  ]
}

interface MerchProductsTableProps {
  products: MerchProduct[]
  loading?: boolean
}

export function MerchProductsTable({ products, loading }: MerchProductsTableProps) {
  const [productToDelete, setProductToDelete] = useState<MerchProduct | null>(null)
  const [deleteProduct, { loading: isDeleting }] = useMutation(DELETE_MERCH_PRODUCT, {
    refetchQueries: ['GetMerchProducts'],
  })

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    try {
      await deleteProduct({ variables: { id: productToDelete.id } })
      toast.success('Product deleted')
      setProductToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    }
  }

  return (
    <>
      <DataTable
        data={products}
        columns={buildColumns(setProductToDelete)}
        loading={loading}
        showIndexColumn={false}
        emptyMessage="No products found."
        toolbarConfig={{ searchPlaceholder: 'Search products…' }}
      />
      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Delete this product?"
        description={`"${getDisplayName(productToDelete?.name) || 'This product'}" and its variants will be permanently deleted. This cannot be undone.`}
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
