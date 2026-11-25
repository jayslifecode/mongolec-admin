'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { StoriesTable } from '@/features/stories/components/stories-table'
import { GET_STORIES } from '@/graphql/queries/stories'
import type { Story } from '@/features/stories/types'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'

interface GetStoriesData {
  getStories: {
    stories: Story[]
    pagination: { total: number }
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'published', label: 'Published', filter: 'PUBLISHED' as const },
  { value: 'draft', label: 'Draft', filter: 'DRAFT' as const },
  { value: 'archived', label: 'Archived', filter: 'ARCHIVED' as const },
]

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState('all')

  const activeFilter = STATUS_TABS.find((t) => t.value === activeTab)?.filter

  const { data, loading, error, refetch } = useQuery<GetStoriesData>(GET_STORIES, {
    variables: { status: activeFilter, limit: 100, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const { data: allData, loading: allLoading } = useQuery<GetStoriesData>(GET_STORIES, {
    variables: { limit: 1000, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const stories = data?.getStories?.stories ?? []
  const allStories = allData?.getStories?.stories ?? []

  const stats = [
    { label: 'Total', value: allLoading ? '—' : allStories.length },
    {
      label: 'Published',
      value: allLoading ? '—' : allStories.filter((s) => s.status === 'PUBLISHED').length,
    },
    {
      label: 'Draft',
      value: allLoading ? '—' : allStories.filter((s) => s.status === 'DRAFT').length,
    },
    {
      label: 'Featured',
      value: allLoading ? '—' : allStories.filter((s) => s.featured).length,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stories"
        description="Manage impact stories, testimonials, and profiles"
        actions={
          <Button size="sm" asChild>
            <Link href="/stories/create">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              New Story
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={allLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-9" aria-label="Filter stories by status">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {!loading && !error && stories.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon={BookOpen}
                  title="No stories found"
                  description="Create a new story to get started."
                  action={
                    <Button size="sm" asChild>
                      <Link href="/stories/create">
                        <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                        New Story
                      </Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <StoriesTable
                stories={stories}
                loading={loading && stories.length === 0}
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
