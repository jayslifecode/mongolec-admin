'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { MapPin, Search } from 'lucide-react'
import { NominationsTable } from '@/features/nominations/components/nominations-table'
import { GET_NOMINATIONS, GET_NOMINATION_STATS } from '@/graphql/queries/nominations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'

interface GetNominationsData {
  getNominations: {
    nominations: any[]
    pagination: any
  }
}

interface GetNominationStatsData {
  getNominationStats: {
    total: number
    pending: number
    underReview: number
    approved: number
    rejected: number
    selected: number
    notSelected: number
  }
}

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'pending', label: 'Pending', filter: 'PENDING' },
  { value: 'under_review', label: 'Under Review', filter: 'UNDER_REVIEW' },
  { value: 'approved', label: 'Approved', filter: 'APPROVED' },
  { value: 'rejected', label: 'Rejected', filter: 'REJECTED' },
  { value: 'selected', label: 'Selected', filter: 'SELECTED' },
]

const COUNTRIES = ['Mongolia', 'Russia', 'China', 'Kazakhstan', 'Kyrgyzstan']

const getDisplayName = (field: string | { en: string; mn: string } | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

export default function NominationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [countryFilter, setCountryFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  const activeFilter = STATUS_TABS.find(t => t.value === activeTab)?.filter

  const { data: statsData, loading: statsLoading } = useQuery<GetNominationStatsData>(
    GET_NOMINATION_STATS,
    { fetchPolicy: 'cache-and-network' }
  )

  const { data, loading, error, refetch } = useQuery<GetNominationsData>(GET_NOMINATIONS, {
    variables: { status: activeFilter, country: countryFilter, limit: 100, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const nominations = data?.getNominations?.nominations ?? []
  const s = statsData?.getNominationStats

  const filteredNominations = nominations.filter((nomination: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      getDisplayName(nomination.parkNames).toLowerCase().includes(q) ||
      (nomination.partnerOrganizationName?.toLowerCase() ?? '').includes(q) ||
      nomination.country.toLowerCase().includes(q)
    )
  })

  const stats = [
    { label: 'Total', value: statsLoading ? '—' : (s?.total ?? 0) },
    { label: 'Pending', value: statsLoading ? '—' : ((s?.pending ?? 0) + (s?.underReview ?? 0)) },
    { label: 'Approved', value: statsLoading ? '—' : (s?.approved ?? 0) },
    { label: 'Selected', value: statsLoading ? '—' : (s?.selected ?? 0) },
    { label: 'Rejected', value: statsLoading ? '—' : ((s?.rejected ?? 0) + (s?.notSelected ?? 0)) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nominations"
        description="Review and manage park nominations"
      />

      <StatBar stats={stats} loading={statsLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <TabsList className="h-9" aria-label="Filter nominations by status">
            {STATUS_TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-4">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-2 shrink-0">
            <Select value={countryFilter ?? 'all'} onValueChange={(v) => setCountryFilter(v === 'all' ? undefined : v)}>
              <SelectTrigger className="h-9 w-[160px] text-xs" aria-label="Filter by country">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search nominations…"
                aria-label="Search nominations by park, organization or country"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 w-[200px] text-xs"
              />
            </div>
          </div>
        </div>

        {STATUS_TABS.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {!loading && !error && filteredNominations.length === 0 ? (
              <div className="rounded-xl border border-border bg-card">
                <EmptyState
                  icon={MapPin}
                  title="No nominations found"
                  description={
                    searchQuery
                      ? 'No nominations match your search. Try a different park or organization.'
                      : 'Nominations will appear here once submitted.'
                  }
                />
              </div>
            ) : (
              <NominationsTable
                nominations={filteredNominations}
                loading={loading && nominations.length === 0}
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
