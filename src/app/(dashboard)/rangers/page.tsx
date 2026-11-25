'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Plus } from 'lucide-react'
import { RangersTable } from '@/features/rangers/components/rangers-table'
import { GET_PARK_PARTNERSHIPS } from '@/graphql/queries/rangers'
import { ListError } from '@/features/people/components/list-error'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, StatBar, EmptyState } from '@/components/admin'
import type { ParkPartnership } from '@/features/rangers/types'

interface GetParkPartnershipsData {
  getParkPartnerships: ParkPartnership[]
}

const COUNTRIES = ['Mongolia', 'Russia', 'China', 'Kazakhstan', 'Kyrgyzstan']

const STATUS_TABS = [
  { value: 'all', label: 'All', filter: undefined },
  { value: 'active', label: 'Active', filter: 'ACTIVE' },
  { value: 'proposed', label: 'Proposed', filter: 'PROPOSED' },
  { value: 'inactive', label: 'Inactive', filter: 'INACTIVE' },
]

const getDisplayName = (field: string | { en: string; mn: string } | undefined): string => {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

const PARTNERS_PAGE_SIZE = 500

export default function ParkPartnersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [countryFilter, setCountryFilter] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState('')

  // Load every status at once so the counts above the tabs stay right on every tab.
  const { data, loading, error, refetch } = useQuery<GetParkPartnershipsData>(GET_PARK_PARTNERSHIPS, {
    variables: { country: countryFilter, limit: PARTNERS_PAGE_SIZE, page: 1 },
    fetchPolicy: 'cache-and-network',
  })

  const partners = data?.getParkPartnerships ?? []
  const isInitialLoad = loading && !data
  const activeFilter = STATUS_TABS.find((t) => t.value === activeTab)?.filter

  const visiblePartners = partners.filter((partner) => {
    if (activeFilter && partner.status !== activeFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.trim().toLowerCase()
    return (
      getDisplayName(partner.parkName).toLowerCase().includes(q) ||
      partner.country.toLowerCase().includes(q) ||
      getDisplayName(partner.partnershipType).toLowerCase().includes(q)
    )
  })

  const countBy = (status: string) => partners.filter((r) => r.status === status).length
  const stats = [
    { label: 'Total', value: partners.length },
    { label: 'Active', value: countBy('ACTIVE') },
    { label: 'Proposed', value: countBy('PROPOSED') },
    { label: 'Inactive', value: countBy('INACTIVE') },
  ]

  const hasFilters = Boolean(searchQuery.trim()) || Boolean(countryFilter) || activeTab !== 'all'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Park Partners"
        description="Parks and reserves that partner with Rally for Rangers"
        actions={
          <Button size="sm" asChild>
            <Link href="/rangers/create">
              <Plus className="mr-1.5 h-4 w-4" />
              Add park partner
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={isInitialLoad} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-9">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="px-4 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex shrink-0 gap-2">
            <Select value={countryFilter ?? 'all'} onValueChange={(v) => setCountryFilter(v === 'all' ? undefined : v)}>
              <SelectTrigger className="h-9 w-[160px] text-xs" aria-label="Filter by country">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-3.5 w-3.5" aria-hidden="true" />
              <Input
                type="search"
                aria-label="Search park partners"
                placeholder="Search park partners…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-[200px] pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          {error && !data ? (
            <ListError message={error.message} onRetry={() => refetch()} />
          ) : !isInitialLoad && visiblePartners.length === 0 ? (
            <div className="border-border bg-card rounded-xl border">
              <EmptyState
                icon={MapPin}
                title={hasFilters ? 'No park partners match' : 'No park partners yet'}
                description={
                  hasFilters ? 'Try a different tab, country or search.' : 'Park partners will appear here once added.'
                }
              />
            </div>
          ) : (
            <RangersTable rangers={visiblePartners} loading={isInitialLoad} onActionComplete={() => refetch()} />
          )}
        </div>
      </Tabs>
    </div>
  )
}
