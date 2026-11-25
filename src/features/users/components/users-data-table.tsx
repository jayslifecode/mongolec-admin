import { getUsers } from '../lib/users-api'
import { UsersDataTableClient } from './users-data-table-client'
import type { UsersPageSearchParams } from '../types'

interface UsersDataTableProps {
  searchParams: Promise<UsersPageSearchParams>
}

export async function UsersDataTable({ searchParams }: UsersDataTableProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const pageSize = Math.max(1, parseInt(params.pageSize ?? '20', 10) || 20)
  const search = params.search ?? ''

  try {
    const data = await getUsers({
      page,
      limit: pageSize,
      search: search || undefined,
      status: params.status as 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE' | undefined,
    })
    return (
      <UsersDataTableClient
        users={data.users}
        totalItems={data.pagination.total}
        currentPage={page}
        pageSize={pageSize}
        search={search}
      />
    )
  } catch (error) {
    return (
      <UsersDataTableClient
        users={[]}
        totalItems={0}
        currentPage={page}
        pageSize={pageSize}
        search={search}
        error={error instanceof Error ? error.message : 'Something went wrong.'}
      />
    )
  }
}
