'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { StoryForm } from '@/features/stories/components/story-form'
import { GET_STORY_BY_ID } from '@/graphql/queries/stories'
import type { Story } from '@/features/stories/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, BookOpen } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/admin'

interface GetStoryByIdData {
  getStory: Story
}

export default function StoryEditPage() {
  const params = useParams()
  const storyId = params.id as string
  const [language, setLanguage] = useState<'en' | 'mn'>('en')

  const { data, loading, error } = useQuery<GetStoryByIdData>(GET_STORY_BY_ID, {
    variables: { id: storyId },
    skip: !storyId,
  })

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState icon={BookOpen} title="Loading story…" className="py-20" />
      </div>
    )
  }

  if (error || !data?.getStory) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-6">
        <PageHeader title="Edit Story" backHref="/stories" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error?.message || 'Story not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const story = data.getStory
  const title = typeof story.title === 'string' ? story.title : story.title?.en || 'Edit Story'

  return (
    <div className="space-y-5 max-w-4xl mx-auto p-6">
      <PageHeader
        title={title}
        description="Update story information and content"
        backHref="/stories"
        lang={language}
        onLangChange={setLanguage}
      />
      <StoryForm mode="edit" language={language} storyId={storyId} initialData={story} />
    </div>
  )
}
