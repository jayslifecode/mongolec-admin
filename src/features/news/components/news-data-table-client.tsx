'use client'

import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Edit, Eye, Newspaper, Star, Trash2, UserCircle2, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useMutation } from '@apollo/client/react'

import { DataTable, createActionsColumn } from '@/components/data-table'
import { StatusBadge } from '@/components/admin'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { QueryErrorState } from '@/components/query-error-state'
import { useUrlTableState } from '@/hooks/use-url-table-state'
import type { StatusTone } from '@/lib/ui/status-tones'
import { Button } from '@/components/ui/button'
import { DELETE_NEWS_ARTICLE } from '@/graphql/mutations/news'

import type { NewsArticle } from '../types'
import { priorityConfig, statusConfig } from '../types'

interface NewsDataTableClientProps {
  articles: NewsArticle[]
  totalItems: number
  currentPage: number
  pageSize: number
  search?: string
  /** Set when the list could not be loaded. */
  error?: string
}

function NewsActions({
  article,
  onDelete,
}: {
  article: NewsArticle
  onDelete: (article: NewsArticle) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
        <Link href={`/news/${article.id}/edit`} aria-label={`Edit ${article.title}`}>
          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        aria-label={`Delete ${article.title}`}
        onClick={() => onDelete(article)}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

function buildColumns(onDelete: (article: NewsArticle) => void): ColumnDef<NewsArticle>[] {
  return [
  {
    accessorKey: 'title',
    header: 'Article',
    cell: ({ row }) => {
      const article = row.original
      const isBreaking = article.isBreaking || article.priority === 'breaking'
      const isFeatured = article.isFeatured || article.featured
      return (
        <div className="flex items-start gap-3">
          {article.featuredImage ? (
            <div className="relative h-12 w-12 rounded-md overflow-hidden border flex-shrink-0">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-md bg-muted border flex items-center justify-center flex-shrink-0">
              <Newspaper className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {isBreaking && (
                <StatusBadge tone="danger">
                  <Zap className="h-3 w-3" aria-hidden="true" />
                  Breaking
                </StatusBadge>
              )}
              {isFeatured && (
                <StatusBadge>
                  <Star className="h-3 w-3" aria-hidden="true" />
                  Featured
                </StatusBadge>
              )}
            </div>
            <div className="font-medium text-sm leading-snug max-w-[280px] truncate">
              {article.title}
            </div>
            <div className="text-xs text-muted-foreground font-mono max-w-[280px] truncate">
              /{article.slug}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: 'meta',
    header: 'Category & Status',
    cell: ({ row }) => {
      const article = row.original
      const categoryName = article.category?.name ?? null
      const statusConf = statusConfig[article.status as keyof typeof statusConfig] as
        | { label: string; tone: StatusTone }
        | undefined
      return (
        <div className="space-y-1">
          {categoryName ? (
            <StatusBadge>{categoryName}</StatusBadge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
          <div>
            <StatusBadge tone={statusConf?.tone ?? 'neutral'} className="mt-1">
              {statusConf?.label ?? article.status}
            </StatusBadge>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const article = row.original
      if (article.priority === 'normal')
        return <span className="text-xs text-muted-foreground">Normal</span>
      const conf = priorityConfig[article.priority as keyof typeof priorityConfig] as
        | { label: string; tone: StatusTone }
        | undefined
      return <StatusBadge tone={conf?.tone ?? 'neutral'}>{conf?.label ?? article.priority}</StatusBadge>
    },
  },
  {
    accessorKey: 'byline',
    header: 'Author',
    cell: ({ row }) => {
      const byline = row.original.byline
      if (!byline) return <span className="text-sm text-muted-foreground">—</span>
      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <UserCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{byline}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'views',
    header: 'Views',
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm">
        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{(row.original.views ?? 0).toLocaleString()}</span>
      </div>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published',
    cell: ({ row }) => {
      const article = row.original
      if (article.status === 'scheduled' && article.scheduledAt) {
        return (
          <div className="text-xs">
            <div className="text-warning font-medium">Scheduled</div>
            <div className="text-muted-foreground">
              {format(new Date(article.scheduledAt), 'MMM dd, yyyy')}
            </div>
          </div>
        )
      }
      if (!article.publishedAt)
        return <span className="text-xs text-muted-foreground">—</span>
      return (
        <div className="text-xs text-muted-foreground">
          {format(new Date(article.publishedAt), 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  createActionsColumn<NewsArticle>(({ row }) => <NewsActions article={row.original} onDelete={onDelete} />),
  ]
}

export function NewsDataTableClient({
  articles,
  totalItems,
  currentPage,
  pageSize,
  search,
  error,
}: NewsDataTableClientProps) {
  const router = useRouter()
  const tableState = useUrlTableState({ pageIndex: currentPage - 1, pageSize, search })
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null)
  const [deleteArticle, { loading: isDeleting }] = useMutation(DELETE_NEWS_ARTICLE)

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return
    try {
      await deleteArticle({ variables: { id: articleToDelete.id } })
      toast.success('Article deleted')
      setArticleToDelete(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete article')
    }
  }

  if (error) {
    return <QueryErrorState title="Couldn't load articles" message={error} onRetry={() => router.refresh()} />
  }

  return (
    <>
      <DataTable
        data={articles}
        columns={buildColumns(setArticleToDelete)}
        manualPagination
        manualFiltering
        pageCount={Math.ceil(totalItems / pageSize)}
        {...tableState}
        showIndexColumn={false}
        emptyMessage="No articles found."
        toolbarConfig={{
          searchPlaceholder: 'Search articles, categories, or authors…',
          enableView: true,
          enableFilter: false,
        }}
      />
      <ConfirmDialog
        open={!!articleToDelete}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
        title="Delete this article?"
        description={`"${articleToDelete?.title ?? ''}" will be permanently deleted. This cannot be undone.`}
        isPending={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
