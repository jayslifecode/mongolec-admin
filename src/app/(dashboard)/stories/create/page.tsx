'use client'

import { useState } from 'react'
import { StoryForm } from '@/features/stories/components/story-form'
import { PageHeader } from '@/components/admin'

export default function StoryCreatePage() {
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  return (
    <div className="space-y-5 max-w-4xl mx-auto p-6">
      <PageHeader
        title="Create Story"
        description="Add a new story and build its content"
        backHref="/stories"
        lang={language}
        onLangChange={setLanguage}
      />
      <StoryForm mode="create" language={language} />
    </div>
  )
}
