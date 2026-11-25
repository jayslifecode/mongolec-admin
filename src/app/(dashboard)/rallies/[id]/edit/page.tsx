'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { RallyForm } from '@/features/rallies/components/rally-form'
import { GET_RALLY_BY_ID } from '@/graphql/queries/rallies'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Trophy } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/admin'

interface GetRallyByIdData {
  getRally: any
}

export default function RallyEditPage() {
  const params = useParams()
  const rallyId = params.id as string
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  const { data, loading, error } = useQuery<GetRallyByIdData>(GET_RALLY_BY_ID, {
    variables: { id: rallyId },
    skip: !rallyId,
  })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState icon={Trophy} title="Loading rally…" className="py-20" />
      </div>
    )
  }

  if (error || !data?.getRally) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageHeader title="Edit Rally" backHref="/rallies" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Rally not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const rally = data.getRally
  const title = typeof rally.title === 'string' ? rally.title : rally.title?.en || 'Edit Rally'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={title}
        description="Update rally information and settings"
        backHref="/rallies"
        lang={language}
        onLangChange={setLanguage}
      />
      <RallyForm mode="edit" language={language} onLanguageChange={setLanguage} rallyId={rallyId} initialData={rally} />
    </div>
  )
}
