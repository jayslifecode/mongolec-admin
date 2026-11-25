'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2, MoreHorizontal, Building2 } from 'lucide-react'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, createCreatedAtColumn } from '@/components/data-table'
import type { StatusTone } from '@/lib/ui/status-tones'
import type { Tenant } from '../types'
import { tenantStatusConfig, tenantPlanConfig } from '../types'

function ActionsCell({
  tenant,
  onDelete,
}: {
  tenant: Tenant
  onDelete?: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label={`Actions for ${tenant.name}`}>
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/tenants/${tenant.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete?.(tenant.id)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildColumns(onDelete?: (id: string) => void): ColumnDef<Tenant>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Organization',
      cell: ({ row }) => {
        const tenant = row.original
        const subline = tenant.domain
          ? `${tenant.slug} · ${tenant.domain}`
          : tenant.slug
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted border flex-shrink-0">
              <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{tenant.name}</div>
              <div className="text-xs text-muted-foreground font-mono truncate">{subline}</div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'meta',
      header: 'Plan & Status',
      cell: ({ row }) => {
        const tenant = row.original
        const planConf = tenantPlanConfig[tenant.plan] as { label: string; tone: StatusTone } | undefined
        const statusConf = tenantStatusConfig[tenant.status] as { label: string; tone: StatusTone } | undefined
        return (
          <div>
            <StatusBadge tone={planConf?.tone ?? 'neutral'}>{planConf?.label ?? tenant.plan}</StatusBadge>
            <div className="mt-1">
              <StatusBadge tone={statusConf?.tone ?? 'neutral'}>{statusConf?.label ?? tenant.status}</StatusBadge>
            </div>
          </div>
        )
      },
    },
    createCreatedAtColumn<Tenant>(),
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => <ActionsCell tenant={row.original} onDelete={onDelete} />,
    },
  ]
}

interface TenantsTableProps {
  tenants: Tenant[]
  loading?: boolean
  onDelete?: (id: string) => void
}

export function TenantsTable({ tenants, loading, onDelete }: TenantsTableProps) {
  const columns = buildColumns(onDelete)

  return (
    <DataTable
      data={tenants}
      columns={columns}
      loading={loading}
      showIndexColumn={false}
      emptyMessage="No tenants found."
      toolbarConfig={{ searchPlaceholder: 'Search tenants…' }}
    />
  )
}
