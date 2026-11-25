'use client'

import { useCallback, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PaginationState, Updater } from '@tanstack/react-table'

type Patch = Record<string, string | number | null | undefined>

/** Builds the list URL with `patch` applied. Empty values and page 1 are left out of the query. */
export function buildTableUrl(
  pathname: string,
  current: URLSearchParams,
  patch: Patch,
  options: { resetPage?: boolean } = {}
): string {
  const next = new URLSearchParams(current.toString())
  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === '' || (key === 'page' && Number(value) <= 1)) {
      next.delete(key)
    } else {
      next.set(key, String(value))
    }
  }
  if (options.resetPage && !('page' in patch)) next.delete('page')
  const query = next.toString()
  return query ? `${pathname}?${query}` : pathname
}

interface UrlTableStateInput {
  pageIndex: number
  pageSize: number
  search?: string
}

/** Keeps a server-rendered table's page, page size and search in the URL. */
export function useUrlTableState({ pageIndex, pageSize, search = '' }: UrlTableStateInput) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const navigate = useCallback(
    (patch: Patch, options?: { resetPage?: boolean }) => {
      startTransition(() => router.push(buildTableUrl(pathname, searchParams, patch, options)))
    },
    [router, pathname, searchParams]
  )

  const onPaginationChange = useCallback(
    (updater: Updater<PaginationState>) => {
      const current = { pageIndex, pageSize }
      const next = typeof updater === 'function' ? updater(current) : updater
      const sizeChanged = next.pageSize !== pageSize
      navigate({ page: sizeChanged ? 1 : next.pageIndex + 1, pageSize: next.pageSize })
    },
    [navigate, pageIndex, pageSize]
  )

  const onSearchChange = useCallback(
    (value: string) => navigate({ search: value.trim() }, { resetPage: true }),
    [navigate]
  )

  return {
    pagination: { pageIndex, pageSize },
    onPaginationChange,
    searchValue: search,
    onSearchChange,
    isPending,
  }
}
