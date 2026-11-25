'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, Search } from 'lucide-react'
import { ApplicationsTable } from '@/features/applications/components/applications-table'
import { GET_APPLICATIONS, GET_APPLICATION_STATS } from '@/graphql/queries/applications'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'

interface GetApplicationsData {
  getApplications: {
    applications: any[]
    pagination: any
  }
}

interface GetApplicationStatsData {
  getApplicationStats: {
    totalApplications: number
    pendingApplications: number
    approvedApplications: number
    rejectedApplications: number
    waitlistedApplications: number
    confirmedApplications: number
    riderCount: number
    supporterCount: number
    totalRaising: number
  }
}

interface GetRalliesData {
  getRallies: {
    rallies: any[]
    pagination: any
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'pending', label: 'Pending', filter: 'PENDING' },
  { value: 'under_review', label: 'Under Review', filter: 'UNDER_REVIEW' },
  { value: 'approved', label: 'Approved', filter: 'APPROVED' },
  { value: 'confirmed', label: 'Confirmed', filter: 'CONFIRMED' },
  { value: 'waitlisted', label: 'Waitlisted', filter: 'WAITLIST' },
  { value: 'rejected', label: 'Rejected', filter: 'REJECTED' },
]

const getDisplayName = (field: string | { en: string; mn: string } | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [rallyFilter, setRallyFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const activeFilter = STATUS_TABS.find(t => t.value === activeTab)?.filter

  const { data: statsData, loading: statsLoading } = useQuery<GetApplicationStatsData>(
    GET_APPLICATION_STATS,
    { fetchPolicy: 'cache-and-network' }
  )

  const { data: ralliesData } = useQuery<GetRalliesData>(GET_RALLIES, {
    variables: { limit: 100, page: 1 },
  })

  const { data, loading, error, refetch } = useQuery<GetApplicationsData>(GET_APPLICATIONS, {
    variables: { status: activeFilter, rallyId: rallyFilter, limit: 100, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const applications = data?.getApplications?.applications ?? []
  const s = statsData?.getApplicationStats
  const rallies = ralliesData?.getRallies?.rallies ?? []

  const filteredApplications = applications.filter((app: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(q) ||
      app.email.toLowerCase().includes(q) ||
      getDisplayName(app.rally?.title).toLowerCase().includes(q)
    )
  })

  const stats = [
    { label: 'Total', value: statsLoading ? '—' : (s?.totalApplications ?? 0) },
    { label: 'Pending', value: statsLoading ? '—' : (s?.pendingApplications ?? 0) },
    { label: 'Approved', value: statsLoading ? '—' : (s?.approvedApplications ?? 0) },
    { label: 'Confirmed', value: statsLoading ? '—' : (s?.confirmedApplications ?? 0) },
    { label: 'Waitlisted', value: statsLoading ? '—' : (s?.waitlistedApplications ?? 0) },
    { label: 'Rejected', value: statsLoading ? '—' : (s?.rejectedApplications ?? 0) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and manage rally applications"
      />

      <StatBar stats={stats} loading={statsLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="h-9" aria-label="Filter applications by status">
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-2 shrink-0">
            <Select value={rallyFilter ?? 'all'} onValueChange={(v) => setRallyFilter(v === 'all' ? undefined : v)}>
              <SelectTrigger className="h-9 w-[180px] text-xs" aria-label="Filter by rally">
                <SelectValue placeholder="All Rallies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rallies</SelectItem>
                {rallies.map((rally: any) => (
                  <SelectItem key={rally.id} value={rally.id}>
                    {getDisplayName(rally.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search applicant…"
                aria-label="Search applicants by name, email or rally"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-[200px] text-xs"
              />
            </div>
          </div>
        </div>

        {STATUS_TABS.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {!loading && !error && filteredApplications.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon={FileText}
                  title="No applications found"
                  description={
                    searchQuery
                      ? 'No applications match your search. Try a different name or email.'
                      : 'Applications will appear here once submitted.'
                  }
                />
              </div>
            ) : (
              <ApplicationsTable
                applications={filteredApplications}
                loading={loading && applications.length === 0}
                error={error?.message}
                onRetry={() => refetch()}
                onActionComplete={() => refetch()}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
