'use client'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import {
  MapPin,
  FileText,
  Trophy,
  ShoppingBag,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { GET_NOMINATION_STATS } from '@/graphql/queries/nominations'
import { GET_APPLICATION_STATS } from '@/graphql/queries/applications'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { GET_MERCH_ORDERS } from '@/graphql/queries/merch-orders'
import { type MerchOrder, paidPayment } from '@/features/merch/types/orders'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { canSeePage } from '@/lib/navigation'
import { useAuthStore } from '@/stores/auth-store'

const MERCH_ORDERS_PATH = '/merch/orders'

function CardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-danger">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">Could not load. {message}</span>
      <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  sub,
  href,
  loading,
  error,
  onRetry,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  sub?: string
  href: string
  loading?: boolean
  error?: string
  onRetry: () => void
}) {
  return (
    <Card className="border border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {error ? (
          <CardError message={error} onRetry={onRetry} />
        ) : (
          <>
            {loading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{value}</div>
            )}
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            <Link
              href={href}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}

type NominationStats = {
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

type ApplicationStats = {
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

type RalliesData = {
  getRallies: {
    rallies: Array<{ id: string; title: string | { en?: string; mn?: string }; status: string }>
    pagination: { total: number }
  }
}

export default function DashboardPage() {
  const { data: nomData, loading: nomLoading, error: nomError, refetch: refetchNom } = useQuery<NominationStats>(GET_NOMINATION_STATS)
  const { data: appData, loading: appLoading, error: appError, refetch: refetchApp } = useQuery<ApplicationStats>(GET_APPLICATION_STATS)
  const { data: rallyData, loading: rallyLoading, error: rallyError, refetch: refetchRally } = useQuery<RalliesData>(GET_RALLIES, {
    variables: { status: 'ONGOING', limit: 10 },
  })
  // Shop figures only for people who have the Merchandise menu (not a rally manager).
  const viewer = useAuthStore((s) => s.user)
  const showMerch = canSeePage(MERCH_ORDERS_PATH, sidebarData.navGroups, viewer)
  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useQuery<{ getMerchOrders: MerchOrder[] }>(
    GET_MERCH_ORDERS,
    { variables: { limit: 500 }, skip: !showMerch }
  )

  const nom = nomData?.getNominationStats
  const app = appData?.getApplicationStats
  const activeRallies = rallyData?.getRallies?.rallies?.length ?? 0

  // Merch sales — computed from paid orders.
  const orders = ordersData?.getMerchOrders ?? []
  const paidOrders = orders.filter((o) => o.status === 'PAID')
  const grossSales = paidOrders.reduce((s, o) => s + o.total, 0)
  const totalFees = paidOrders.reduce((s, o) => s + (paidPayment(o)?.fee ?? 0), 0)
  const netRevenue = paidOrders.reduce(
    (s, o) => s + (paidPayment(o)?.netAmount ?? o.total),
    0
  )
  const awaitingCount = orders.filter((o) => o.status === 'AWAITING_PAYMENT').length
  const mnt = (n: number) => `₮${n.toLocaleString()}`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Rallies"
          value={rallyLoading ? '—' : activeRallies}
          icon={Trophy}
          sub="Currently running"
          href="/rallies"
          loading={rallyLoading}
          error={rallyError?.message}
          onRetry={() => void refetchRally()}
        />
        <StatCard
          title="Applications"
          value={appLoading ? '—' : (app?.totalApplications ?? 0)}
          icon={FileText}
          sub={appLoading ? '' : `${app?.pendingApplications ?? 0} pending review`}
          href="/applications"
          loading={appLoading}
          error={appError?.message}
          onRetry={() => void refetchApp()}
        />
        <StatCard
          title="Nominations"
          value={nomLoading ? '—' : (nom?.total ?? 0)}
          icon={MapPin}
          sub={nomLoading ? '' : `${nom?.pending ?? 0} pending review`}
          href="/nominations"
          loading={nomLoading}
          error={nomError?.message}
          onRetry={() => void refetchNom()}
        />
        <StatCard
          title="Approved Nominations"
          value={nomLoading ? '—' : (nom?.approved ?? 0)}
          icon={CheckCircle}
          sub={nomLoading ? '' : `${nom?.selected ?? 0} selected for rally`}
          href="/nominations"
          loading={nomLoading}
          error={nomError?.message}
          onRetry={() => void refetchNom()}
        />
      </div>

      {/* Merch sales summary */}
      {showMerch && (
        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Merch Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersError ? (
              <CardError message={ordersError.message} onRetry={() => void refetchOrders()} />
            ) : ordersLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                <SalesStat label="Net revenue" value={mnt(netRevenue)} />
                <SalesStat label="Gross sales" value={mnt(grossSales)} />
                <SalesStat label="QPay fees" value={mnt(totalFees)} />
                <SalesStat
                  label="Paid orders"
                  value={String(paidOrders.length)}
                  sub={awaitingCount ? `${awaitingCount} awaiting payment` : undefined}
                />
              </div>
            )}
            <Link
              href={MERCH_ORDERS_PATH}
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View orders <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Status breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Nomination Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nomError ? (
              <CardError message={nomError.message} onRetry={() => void refetchNom()} />
            ) : nomLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : (
              <PipelineRows
                total={nom?.total ?? 0}
                rows={[
                  { label: 'Pending', value: nom?.pending ?? 0 },
                  { label: 'Under Review', value: nom?.underReview ?? 0 },
                  { label: 'Approved', value: nom?.approved ?? 0 },
                  { label: 'Selected', value: nom?.selected ?? 0 },
                  { label: 'Rejected', value: nom?.rejected ?? 0 },
                ]}
              />
            )}
            <div className="pt-2">
              <Link href="/nominations" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                Manage nominations <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Application Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appError ? (
              <CardError message={appError.message} onRetry={() => void refetchApp()} />
            ) : appLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))
            ) : (
              <PipelineRows
                total={app?.totalApplications ?? 0}
                rows={[
                  { label: 'Pending', value: app?.pendingApplications ?? 0 },
                  { label: 'Approved', value: app?.approvedApplications ?? 0 },
                  { label: 'Confirmed', value: app?.confirmedApplications ?? 0 },
                  { label: 'Waitlisted', value: app?.waitlistedApplications ?? 0 },
                  { label: 'Rejected', value: app?.rejectedApplications ?? 0 },
                ]}
              />
            )}
            <div className="pt-2">
              <Link href="/applications" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
                Manage applications <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participant breakdown */}
      {!appLoading && app && (app.riderCount > 0 || app.supporterCount > 0) && (
        <Card className="border border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Participant Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold">{app.riderCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Riders</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold">{app.supporterCount}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Supporters</div>
              </div>
              {app.totalRaising > 0 && (
                <>
                  <div className="h-10 w-px bg-border" />
                  <div>
                    <div className="text-2xl font-bold">${app.totalRaising.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Total raising</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SalesStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  )
}

interface PipelineRowData {
  label: string
  value: number
}

/** Neutral bars; the stage holding the most items is drawn in the primary colour. */
function PipelineRows({ rows, total }: { rows: PipelineRowData[]; total: number }) {
  const currentValue = Math.max(...rows.map((r) => r.value))
  return (
    <>
      {rows.map((row) => (
        <PipelineRow
          key={row.label}
          label={row.label}
          value={row.value}
          total={total}
          isCurrent={currentValue > 0 && row.value === currentValue}
        />
      ))}
    </>
  )
}

function PipelineRow({ label, value, total, isCurrent }: PipelineRowData & { total: number; isCurrent: boolean }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div
        className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"
        role="meter"
        aria-label={`${label}: ${value} of ${total}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/40'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right tabular-nums">{value}</span>
    </div>
  )
}
