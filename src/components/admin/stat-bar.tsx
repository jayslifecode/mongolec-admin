import { type ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatItem {
  label: string
  value: number | string
  sub?: string
  accent?: 'default' | 'green' | 'amber' | 'red' | 'blue' | 'primary'
}

interface StatBarProps {
  stats: StatItem[]
  loading?: boolean
  className?: string
}

const accentValue: Record<string, string> = {
  default: 'text-foreground',
  green: 'text-success',
  amber: 'text-warning',
  red: 'text-danger',
  blue: 'text-foreground',
  primary: 'text-primary',
}

export function StatBar({ stats, loading, className }: StatBarProps) {
  return (
    <div className={cn(
      'flex flex-wrap gap-0 rounded-xl border border-border bg-card overflow-hidden',
      className
    )}>
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            'flex-1 min-w-[100px] px-5 py-3.5',
            i < stats.length - 1 && 'border-r border-border',
          )}
        >
          <div className="text-xs font-medium text-muted-foreground mb-1">{stat.label}</div>
          {loading ? (
            <Skeleton className="h-6 w-12" />
          ) : (
            <div className={cn('text-xl font-bold tabular-nums', accentValue[stat.accent ?? 'default'])}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
          )}
          {stat.sub && !loading && (
            <div className="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
          )}
        </div>
      ))}
    </div>
  )
}
