'use client'

import { use } from 'react'
import { useQuery } from '@apollo/client/react'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import { TenantForm } from '@/features/tenant/components/tenant-form'
import { GET_TENANT_BY_ID } from '@/graphql/queries/tenant'
import type { Tenant } from '@/features/tenant/types'

interface GetTenantByIdData {
  getTenantById: Tenant | null
}

export default function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, loading, error, refetch } = useQuery<GetTenantByIdData>(GET_TENANT_BY_ID, {
    variables: { id },
  })

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Edit Tenant" description="Update organization details" backHref="/tenants" />
      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading tenant">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <QueryErrorState title="Couldn't load this tenant" message={error.message} onRetry={() => void refetch()} />
      ) : !data?.getTenantById ? (
        <QueryErrorState title="Tenant not found" message="It may have been deleted." />
      ) : (
        <TenantForm mode="edit" tenantId={id} initialData={data.getTenantById} />
      )}
    </div>
  )
}
