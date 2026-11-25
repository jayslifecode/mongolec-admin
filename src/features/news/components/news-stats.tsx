import { getNewsStats } from '../lib/news-api'
import { StatBar } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'

export async function NewsStats() {
  try {
    const s = await getNewsStats()
    return (
      <StatBar
        stats={[
          { label: 'Total Articles', value: s.total },
          { label: 'Published', value: s.published },
          { label: 'Breaking', value: s.breaking },
          { label: 'Featured', value: s.featured },
          { label: 'Drafts', value: s.drafts },
          { label: 'Scheduled', value: s.scheduled },
        ]}
      />
    )
  } catch (error) {
    return (
      <QueryErrorState
        title="Couldn't load article totals"
        message={error instanceof Error ? error.message : 'Something went wrong.'}
      />
    )
  }
}
