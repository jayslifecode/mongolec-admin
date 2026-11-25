'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client/react'
import { StoryForm } from '@/features/stories/components/story-form'
import { GET_STORY_BY_ID } from '@/graphql/queries/stories'
import type { Story } from '@/features/stories/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/admin'

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
      <div className="max-w-4xl mx-auto space-y-6" role="status" aria-label="Loading story">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error || !data?.getStory) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={title}
        description="Update story information and content"
        backHref="/stories"
        lang={language}
        onLangChange={setLanguage}
      />
      <StoryForm mode="edit" language={language} onLanguageChange={setLanguage} storyId={storyId} initialData={story} />
    </div>
  )
}
