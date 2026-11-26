'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trophy } from 'lucide-react'
import Link from 'next/link'
import { RalliesTable } from '@/features/rallies/components/rallies-table'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'

interface GetRalliesData {
  getRallies: {
    rallies: any[]
    pagination: any
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'upcoming', label: 'Upcoming', filter: 'UPCOMING' as const },
  { value: 'ongoing', label: 'Ongoing', filter: 'ONGOING' as const },
  { value: 'completed', label: 'Completed', filter: 'COMPLETED' as const },
  { value: 'draft', label: 'Draft', filter: 'DRAFT' as const },
]

const FEATURED_FILTERS = [
  { label: 'All rallies', featuredOnly: false },
  { label: 'Featured', featuredOnly: true },
]

export default function RalliesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const activeFilter = STATUS_TABS.find(t => t.value === activeTab)?.filter

  const { data, loading, error, refetch } = useQuery<GetRalliesData>(GET_RALLIES, {
    variables: { status: activeFilter, isFeatured: featuredOnly ? true : undefined, limit: 100, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const { data: allData, loading: allLoading } = useQuery<GetRalliesData>(GET_RALLIES, {
    variables: { limit: 1000, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const rallies = data?.getRallies?.rallies ?? []
  const allRallies = allData?.getRallies?.rallies ?? []

  const stats = [
    { label: 'Total', value: allLoading ? '—' : allRallies.length },
    { label: 'Upcoming', value: allLoading ? '—' : allRallies.filter((r: any) => r.status === 'UPCOMING').length },
    { label: 'Ongoing', value: allLoading ? '—' : allRallies.filter((r: any) => r.status === 'ONGOING').length },
    { label: 'Recruiting', value: allLoading ? '—' : allRallies.filter((r: any) => r.isRecruiting).length },
    { label: 'Completed', value: allLoading ? '—' : allRallies.filter((r: any) => r.status === 'COMPLETED').length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rallies"
        description="Manage rallies, dates, and participation"
        actions={
          <Button size="sm" asChild>
            <Link href="/rallies/create">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              New Rally
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={allLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center gap-3">
          <TabsList className="h-9" aria-label="Filter rallies by status">
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div role="group" aria-label="Filter rallies by featured" className="inline-flex rounded-lg bg-muted p-[3px]">
            {FEATURED_FILTERS.map(option => (
              <button
                key={option.label}
                type="button"
                aria-pressed={featuredOnly === option.featuredOnly}
                onClick={() => setFeaturedOnly(option.featuredOnly)}
                className="h-[calc(100%-1px)] rounded-md px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {STATUS_TABS.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {!loading && !error && rallies.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon={Trophy}
                  title="No rallies found"
                  description="Create a new rally to get started."
                  action={
                    <Button size="sm" asChild>
                      <Link href="/rallies/create">
                        <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        New Rally
                      </Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <RalliesTable
                rallies={rallies}
                loading={loading && rallies.length === 0}
                error={error?.message}
                onRetry={() => refetch()}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
