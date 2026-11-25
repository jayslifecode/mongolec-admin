'use client'

import { useState } from 'react'
import { RangerForm } from '@/features/rangers/components/ranger-form'
import { PageHeader } from '@/components/admin'

export default function CreateRangerPage() {
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Add park partner"
        description="Register a park that partners with Rally for Rangers"
        backHref="/rangers"
        lang={language}
        onLangChange={setLanguage}
      />
      <RangerForm mode="create" language={language} onLanguageChange={setLanguage} />
    </div>
  )
}
