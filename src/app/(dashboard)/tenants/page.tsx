'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { QueryErrorState } from '@/components/query-error-state'
import { toast } from 'sonner'
import { TenantsTable } from '@/features/tenant/components/tenants-table'
import { GET_TENANTS } from '@/graphql/queries/tenant'
import { DELETE_TENANT } from '@/graphql/mutations/tenant'
import { PageHeader, StatBar } from '@/components/admin'

interface GetTenantsData {
  tenants: any[]
}

export default function TenantsPage() {
  const { data, loading, error, refetch } = useQuery<GetTenantsData>(GET_TENANTS)
  const [deleteTenant, { loading: isDeleting }] = useMutation(DELETE_TENANT)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null)

  const tenants = data?.tenants || []

  const stats = [
    { label: 'Total Tenants', value: tenants.length },
    { label: 'Active', value: tenants.filter((t: any) => t.status === 'ACTIVE').length },
    { label: 'Free Plan', value: tenants.filter((t: any) => t.plan === 'FREE').length },
    { label: 'Pro Plan', value: tenants.filter((t: any) => t.plan === 'PRO').length },
  ]

  const handleDeleteClick = (id: string) => {
    setTenantToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!tenantToDelete) return
    try {
      await deleteTenant({
        variables: { id: tenantToDelete },
        refetchQueries: ['GetTenants'],
      })
      toast.success('Tenant deleted successfully')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete tenant')
    } finally {
      setDeleteDialogOpen(false)
      setTenantToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Manage organizations and their subscriptions"
        actions={
          <Button asChild>
            <Link href="/tenants/create">
              <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
              Create Tenant
            </Link>
          </Button>
        }
      />

      <StatBar stats={stats} loading={loading} />

      {error ? (
        <QueryErrorState
          title="Couldn't load tenants"
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : (
        <TenantsTable tenants={tenants} loading={loading} onDelete={handleDeleteClick} />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete this tenant?"
        description="This permanently deletes the tenant and all associated data. This cannot be undone."
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
