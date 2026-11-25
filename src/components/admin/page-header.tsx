'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SegmentedControl } from './segmented-control'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: ReactNode
  badge?: ReactNode
  lang?: 'en' | 'mn'
  onLangChange?: (lang: 'en' | 'mn') => void
  className?: string
}

export function PageHeader({
  title,
  description,
  backHref,
  actions,
  badge,
  lang,
  onLangChange,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {backHref && (
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" asChild>
            <Link href={backHref} aria-label="Back">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lang && onLangChange && (
          <SegmentedControl
            ariaLabel="Content language"
            value={lang}
            onValueChange={onLangChange}
            options={[{ value: 'en', label: 'EN', ariaLabel: 'English' }, { value: 'mn', label: 'МН', ariaLabel: 'Mongolian' }] as const}
          />
        )}
        {actions}
      </div>
    </div>
  )
}
