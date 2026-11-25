import { serverGraphQL } from '@/lib/server-graphql'
import type { NewsArticle, NewsFilters, PaginatedResponse, NewsStats } from '../types'

/** The API has no total count, so the list fetches up to this many articles and pages them here. */
const ARTICLE_FETCH_LIMIT = 1000

const NEWS_ARTICLES_QUERY = `
  query GetNewsArticles(
    $language: String
    $status: String
    $priority: String
    $categoryId: ID
    $limit: Int
    $offset: Int
  ) {
    getNewsArticles(
      language: $language
      status: $status
      priority: $priority
      categoryId: $categoryId
      limit: $limit
      offset: $offset
    ) {
      id
      slug
      title
      byline
      featuredImage
      status
      priority
      isBreaking
      isFeatured
      publishedAt
      scheduledAt
      category {
        id
        name
        slug
        color
      }
      createdAt
      updatedAt
    }
  }
`

interface RawNewsArticle {
  id: string
  slug: string
  title: string
  byline?: string | null
  featuredImage?: string | null
  status: string
  priority: string
  isBreaking?: boolean
  isFeatured?: boolean
  publishedAt?: string | null
  scheduledAt?: string | null
  category?: {
    id: string
    name: string
    slug: string
    color?: string | null
  } | null
  createdAt: string
  updatedAt: string
}

function mapArticle(raw: RawNewsArticle): NewsArticle {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title ?? '',
    byline: raw.byline,
    status: (raw.status?.toLowerCase() ?? 'draft') as NewsArticle['status'],
    priority: (raw.priority?.toLowerCase() ?? 'normal') as NewsArticle['priority'],
    isBreaking: raw.isBreaking ?? false,
    isFeatured: raw.isFeatured ?? false,
    featured: raw.isFeatured ?? false,
    views: 0,
    publishedAt: raw.publishedAt ?? null,
    scheduledAt: raw.scheduledAt,
    featuredImage: raw.featuredImage ?? null,
    category: raw.category ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export async function getNewsArticles(
  page: number = 1,
  pageSize: number = 10,
  filters: NewsFilters = {}
): Promise<PaginatedResponse<NewsArticle>> {
  const offset = (page - 1) * pageSize

  // Errors propagate so the page can show an error state instead of an empty list.
  const data = await serverGraphQL<{ getNewsArticles: RawNewsArticle[] }>({
    query: NEWS_ARTICLES_QUERY,
    variables: {
      language: filters.language ?? 'en',
      status: filters.status?.[0],
      priority: filters.priority?.[0],
      limit: ARTICLE_FETCH_LIMIT,
      offset: 0,
    },
  })

  let articles = (data.getNewsArticles ?? []).map(mapArticle)

  if (filters.search) {
    const q = filters.search.toLowerCase()
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.category?.name ?? '').toLowerCase().includes(q) ||
        (a.byline ?? '').toLowerCase().includes(q)
    )
  }

  const totalItems = articles.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedArticles = articles.slice(offset, offset + pageSize)

  return {
    data: paginatedArticles,
    totalItems,
    currentPage: page,
    pageSize,
    totalPages,
  }
}

export async function getNewsStats(): Promise<NewsStats> {
  const data = await serverGraphQL<{ getNewsArticles: RawNewsArticle[] }>({
    query: NEWS_ARTICLES_QUERY,
    variables: { language: 'en', limit: ARTICLE_FETCH_LIMIT, offset: 0 },
  })

  const articles = data.getNewsArticles ?? []

  return {
    total: articles.length,
    published: articles.filter((a) => a.status?.toLowerCase() === 'published').length,
    breaking: articles.filter((a) => a.isBreaking || a.priority?.toLowerCase() === 'breaking').length,
    featured: articles.filter((a) => a.isFeatured).length,
    drafts: articles.filter((a) => a.status?.toLowerCase() === 'draft').length,
    scheduled: articles.filter((a) => a.status?.toLowerCase() === 'scheduled').length,
  }
}
