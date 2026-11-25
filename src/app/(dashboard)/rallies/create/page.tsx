'use client'

import { useState } from 'react'
import { RallyForm } from '@/features/rallies/components/rally-form'
import { PageHeader } from '@/components/admin'

export default function RallyCreatePage() {
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Create Rally"
        description="Add a new rally and manage its details"
        backHref="/rallies"
        lang={language}
        onLangChange={setLanguage}
      />
      <RallyForm mode="create" language={language} onLanguageChange={setLanguage} />
    </div>
  )
}
