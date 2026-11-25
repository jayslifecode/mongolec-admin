import { Suspense } from 'react'
import { UsersStats, UsersDataTable } from '@/features/users'
import type { UsersPageSearchParams } from '@/features/users'
import { PageHeader, StatBar } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

interface UsersPageProps {
  searchParams: Promise<UsersPageSearchParams>
}

const STAT_PLACEHOLDERS = [
  { label: 'Total Users', value: 0 },
  { label: 'Active', value: 0 },
  { label: 'Pending', value: 0 },
  { label: 'Inactive', value: 0 },
]

function TableSkeleton() {
  return (
    <div className='rounded-md border' role='status' aria-label='Loading users'>
      <div className='p-4 border-b'>
        <Skeleton className='h-8 w-64' />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='flex items-center gap-4 px-4 py-3 border-b last:border-0'>
          <Skeleton className='h-9 w-9 rounded-full' />
          <Skeleton className='h-5 w-2/5' />
          <Skeleton className='h-5 w-16' />
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-5 w-24' />
        </div>
      ))}
    </div>
  )
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  // Keyed on the query so paging or searching shows the skeleton again.
  const tableKey = JSON.stringify(params)
  return (
    <div className='space-y-6'>
      <PageHeader title='Users' description='Manage user accounts, roles, and permissions' />

      <Suspense fallback={<StatBar stats={STAT_PLACEHOLDERS} loading />}>
        <UsersStats />
      </Suspense>

      <Suspense key={tableKey} fallback={<TableSkeleton />}>
        <UsersDataTable searchParams={Promise.resolve(params)} />
      </Suspense>
    </div>
  )
}
