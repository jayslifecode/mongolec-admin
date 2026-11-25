import { Suspense } from 'react'
import { NewsHeader, NewsStats, NewsDataTable } from '@/features/news'
import type { NewsPageSearchParams } from '@/features/news'
import { StatBar } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

interface NewsPageProps {
  searchParams: Promise<NewsPageSearchParams>
}

const STAT_PLACEHOLDERS = [
  { label: 'Total Articles', value: 0 },
  { label: 'Published', value: 0 },
  { label: 'Breaking', value: 0 },
  { label: 'Featured', value: 0 },
  { label: 'Drafts', value: 0 },
  { label: 'Scheduled', value: 0 },
]

function StatsSkeleton() {
  return <StatBar stats={STAT_PLACEHOLDERS} loading />
}

function TableSkeleton() {
  return (
    <div className='rounded-md border' role='status' aria-label='Loading articles'>
      <div className='p-4 border-b'>
        <Skeleton className='h-8 w-64' />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center gap-4 px-4 py-3 border-b last:border-0'>
          <Skeleton className='h-5 w-2/5' />
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-5 w-24' />
        </div>
      ))}
    </div>
  )
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams
  return (
    <div className='space-y-6'>
      <NewsHeader />

      <Suspense fallback={<StatsSkeleton />}>
        <NewsStats />
      </Suspense>

      <Suspense key={JSON.stringify(params)} fallback={<TableSkeleton />}>
        <NewsDataTable searchParams={Promise.resolve(params)} />
      </Suspense>
    </div>
  )
}
