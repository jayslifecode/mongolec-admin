import { getUserStats } from '../lib/users-api'
import { StatBar } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

export async function UsersStats() {
  try {
    const stats = await getUserStats()
    return (
      <StatBar
        stats={[
          { label: 'Total Users', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Pending', value: stats.pending },
          { label: 'Inactive', value: stats.inactive },
        ]}
      />
    )
  } catch (error) {
    return (
      <QueryErrorState
        title="Couldn't load user totals"
        message={error instanceof Error ? error.message : 'Something went wrong.'}
      />
    )
  }
}
