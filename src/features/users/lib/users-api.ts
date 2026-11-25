import { serverGraphQL } from '@/lib/server-graphql'
import type { UsersResponse, UserStatus } from '../types'

const USERS_QUERY = `
  query GetUsers($page: Int, $limit: Int, $search: String, $status: UserStatus, $orderBy: String, $orderDirection: String) {
    getUsers(page: $page, limit: $limit, search: $search, status: $status, orderBy: $orderBy, orderDirection: $orderDirection) {
      users {
        id
        email
        firstName
        lastName
        isActive
        emailVerified
        createdAt
        updatedAt
        approvedAt
        approvedBy
        rejectedAt
        rejectedBy
        rejectionReason
        tenant { id name slug }
        roles { id role { id name } assignedAt }
      }
      pagination {
        page limit total totalPages currentPage perPage hasNextPage hasPreviousPage
      }
    }
  }
`

interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  status?: UserStatus
  orderBy?: string
  orderDirection?: string
}

export async function getUsers(params: GetUsersParams = {}): Promise<UsersResponse> {
  // Errors propagate: callers show an error state instead of an empty list that looks like "no users".
  const data = await serverGraphQL<{ getUsers: UsersResponse }>({
    query: USERS_QUERY,
    variables: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search || undefined,
      status: params.status || undefined,
      orderBy: params.orderBy || 'createdAt',
      orderDirection: params.orderDirection || 'desc',
    },
  })
  return data.getUsers
}

const USER_APPROVAL_STATS_QUERY = `
  query GetUserApprovalStats {
    getUserApprovalStats {
      totalUsers
      activeUsers
      pendingUsers
      rejectedUsers
      inactiveUsers
    }
  }
`

export async function getUserStats() {
  const data = await serverGraphQL<{
    getUserApprovalStats: {
      totalUsers: number
      activeUsers: number
      pendingUsers: number
      rejectedUsers: number
      inactiveUsers: number
    }
  }>({ query: USER_APPROVAL_STATS_QUERY })
  const s = data.getUserApprovalStats
  return {
    total: s.totalUsers,
    active: s.activeUsers,
    pending: s.pendingUsers,
    inactive: s.inactiveUsers,
  }
}
