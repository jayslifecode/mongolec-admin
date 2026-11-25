'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormField, FormSection, StatusBadge } from '@/components/admin'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

import { CREATE_STORY, UPDATE_STORY } from '@/graphql/mutations/stories'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { slugify } from '../lib/slugify'
import { validateStoryForm, type StoryFormValues } from '../lib/validation'
import { BlockEditor } from './block-editor'
import type { LocalizedText, Story, StoryBlock, StoryContent, StoryType } from '../types'
import { storyStatusConfig, storyTypeConfig } from '../types'

interface StoryFormProps {
  mode?: 'create' | 'edit' | 'view'
  language: 'en' | 'mn'
  /** Lets the form switch to English when the English title is missing. */
  onLanguageChange?: (language: 'en' | 'mn') => void
  storyId?: string
  initialData?: Story
}

interface GetRalliesForSelectData {
  getRallies: { rallies: Array<{ id: string; title: LocalizedText }> }
}

const STORY_TYPE_OPTIONS = Object.keys(storyTypeConfig) as StoryType[]

function normalizeLangField(field: LocalizedText | null | undefined): { en: string; mn: string } {
  if (!field) return { en: '', mn: '' }
  if (typeof field === 'string') return { en: field, mn: field }
  return { en: field.en ?? '', mn: field.mn ?? '' }
}

function getDisplayText(field: LocalizedText | null | undefined): string {
  if (!field) return ''
  if (typeof field === 'string') return field
  return field.en || field.mn || ''
}

function normalizeContent(content: StoryContent | null | undefined): StoryContent {
  if (!content || !Array.isArray(content.blocks)) return { version: 1, blocks: [] }
  return content
}

const FIELD_DOM_ID: Record<string, string> = {
  'title.en': 'title-en',
  slug: 'slug',
  featuredImage: 'featuredImage',
}
const FIELD_ORDER = ['title.en', 'slug', 'featuredImage']

export function StoryForm({ mode = 'create', language, onLanguageChange, storyId, initialData }: StoryFormProps) {
  const router = useRouter()
  const [createStory, { loading: isCreating }] = useMutation(CREATE_STORY)
  const [updateStory, { loading: isUpdating }] = useMutation(UPDATE_STORY)
  const isSubmitting = isCreating || isUpdating
  const isReadOnly = mode === 'view'

  const { data: ralliesData } = useQuery<GetRalliesForSelectData>(GET_RALLIES, {
    variables: { limit: 500, page: 1 },
  })
  const rallyOptions = ralliesData?.getRallies?.rallies ?? []

  const [slugTouched, setSlugTouched] = useState(mode !== 'create')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState(() => {
    if (initialData && mode !== 'create') {
      return {
        title: normalizeLangField(initialData.title),
        slug: initialData.slug || '',
        type: initialData.type,
        rallyId: initialData.rally?.id ?? '',
        excerpt: normalizeLangField(initialData.excerpt),
        featuredImage: initialData.featuredImage || '',
        impactSummary: {
          riders: initialData.impactSummary?.riders ?? 0,
          kilometers: initialData.impactSummary?.kilometers ?? 0,
          bikes: initialData.impactSummary?.bikes ?? 0,
        },
        author: normalizeLangField(initialData.author),
        role: initialData.role || '',
        status: initialData.status,
      }
    }
    return {
      title: { en: '', mn: '' },
      slug: '',
      type: 'IMPACT' as StoryType,
      rallyId: '',
      excerpt: { en: '', mn: '' },
      featuredImage: '',
      impactSummary: { riders: 0, kilometers: 0, bikes: 0 },
      author: { en: '', mn: '' },
      role: '',
      status: 'DRAFT' as const,
    }
  })

  const [blocks, setBlocks] = useState<StoryBlock[]>(() => normalizeContent(initialData?.content).blocks)

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: { ...prev.title, [language]: value },
      slug: !slugTouched && language === 'en' ? slugify(value) : prev.slug,
    }))
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    setFormData((prev) => ({ ...prev, slug: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) return

    const values: StoryFormValues = {
      title: formData.title,
      slug: formData.slug,
      type: formData.type,
      rallyId: formData.rallyId || null,
      excerpt: formData.excerpt,
      featuredImage: formData.featuredImage,
      impactSummary: formData.impactSummary,
      author: formData.author,
      role: formData.role,
    }

    const { isValid, fieldErrors: nextFieldErrors, blockErrors } = validateStoryForm(values, blocks)
    setFieldErrors(nextFieldErrors)

    if (!isValid) {
      const firstKey = FIELD_ORDER.find((key) => nextFieldErrors[key]) ?? Object.keys(nextFieldErrors)[0]
      if (firstKey) {
        toast.error(nextFieldErrors[firstKey])
        if (firstKey === 'title.en' && language !== 'en') onLanguageChange?.('en')
        const domId = FIELD_DOM_ID[firstKey]
        if (domId) window.setTimeout(() => document.getElementById(domId)?.focus(), 0)
      } else if (Object.keys(blockErrors).length > 0) {
        toast.error('Fix the highlighted blocks before saving')
      }
      return
    }

    try {
      const content: StoryContent = { version: 1, blocks }

      const baseInput = {
        title: formData.title,
        slug: formData.slug,
        type: formData.type,
        rallyId: formData.rallyId || null,
        excerpt: formData.excerpt,
        content,
        featuredImage: formData.featuredImage || null,
        impactSummary: formData.impactSummary,
        author: formData.author,
        role: formData.role || null,
      }

      if (mode === 'edit' && storyId) {
        await updateStory({
          variables: { id: storyId, input: baseInput },
          refetchQueries: ['GetStories', 'GetStoryById'],
        })
        toast.success('Story updated successfully')
      } else {
        await createStory({
          variables: { input: baseInput },
          refetchQueries: ['GetStories'],
        })
        toast.success('Story created successfully')
      }

      router.push('/stories')
    } catch (error: unknown) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : `Failed to ${mode === 'edit' ? 'update' : 'create'} story`
      )
    }
  }

  const isTestimonialLike = formData.type === 'TESTIMONIAL' || formData.type === 'RANGER_PROFILE' || formData.type === 'RIDER_PROFILE'
  const statusConfig = storyStatusConfig[formData.status]

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormSection title="Story Information" description={isReadOnly ? 'Story details' : 'Add story details'}>
        <FormField
          id={`title-${language}`}
          label={language === 'en' ? 'Title (English)' : 'Title (Mongolian)'}
          required={language === 'en' && !isReadOnly}
          error={language === 'en' ? fieldErrors['title.en'] : undefined}
        >
          {(c) => (
            <Input
              {...c}
              value={formData.title[language]}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={language === 'en' ? 'Enter story title' : 'Өгүүллэгийн нэр'}
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <FormField
          id="slug"
          label="Slug"
          required={!isReadOnly}
          error={fieldErrors.slug}
          description="URL-friendly, kebab-case. Follows the English title until you edit it."
        >
          {(c) => (
            <Input
              {...c}
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="story-url-slug"
              disabled={isReadOnly}
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">Type<span className="text-destructive" aria-hidden="true">*</span></Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as StoryType }))}
              disabled={isReadOnly}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STORY_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {storyTypeConfig[type]?.label ?? type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rally">Rally</Label>
            <Select
              value={formData.rallyId || 'none'}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, rallyId: value === 'none' ? '' : value }))}
              disabled={isReadOnly}
            >
              <SelectTrigger id="rally">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {rallyOptions.map((rally) => (
                  <SelectItem key={rally.id} value={rally.id}>
                    {getDisplayText(rally.title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`excerpt-${language}`}>Excerpt</Label>
          <Textarea
            id={`excerpt-${language}`}
            value={formData.excerpt[language]}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, excerpt: { ...prev.excerpt, [language]: e.target.value } }))
            }
            placeholder={language === 'en' ? 'Short summary shown in listings...' : 'Товч тайлбар...'}
            rows={3}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <div>
            <StatusBadge tone={statusConfig?.tone ?? 'neutral'}>{statusConfig?.label ?? formData.status}</StatusBadge>
          </div>
          <p className="text-xs text-muted-foreground">
            Use the Publish / Unpublish action from the stories list to change this.
          </p>
        </div>
      </FormSection>

      <FormSection
        title="Featured Image"
        description={isReadOnly ? 'Story featured image' : 'Paste an image URL to use as the featured image'}
      >
        <FormField id="featuredImage" label="Image URL" error={fieldErrors.featuredImage}>
          {(c) => (
            <Input
              {...c}
              type="url"
              value={formData.featuredImage}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))
                if (fieldErrors.featuredImage) setFieldErrors((prev) => ({ ...prev, featuredImage: '' }))
              }}
              placeholder="https://example.com/image.jpg"
              disabled={isReadOnly}
            />
          )}
        </FormField>
        {formData.featuredImage && !fieldErrors.featuredImage && /^https?:\/\//i.test(formData.featuredImage) && (
          <div className="relative w-full max-w-xs aspect-video overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={formData.featuredImage} alt="Featured preview" className="object-cover w-full h-full" />
          </div>
        )}
      </FormSection>

      {isTestimonialLike && (
        <FormSection title="Author" description="Shown for testimonials and profile stories">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`author-${language}`}>Author Name</Label>
              <Input
                id={`author-${language}`}
                value={formData.author[language]}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: { ...prev.author, [language]: e.target.value } }))
                }
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., Park Ranger"
                disabled={isReadOnly}
              />
            </div>
          </div>
        </FormSection>
      )}

      <FormSection title="Impact Summary" description="Aggregate ride impact numbers for this story">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="riders">Riders</Label>
            <Input
              id="riders"
              type="number"
              min="0"
              value={formData.impactSummary.riders}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  impactSummary: { ...prev.impactSummary, riders: parseInt(e.target.value) || 0 },
                }))
              }
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kilometers">Kilometers</Label>
            <Input
              id="kilometers"
              type="number"
              min="0"
              value={formData.impactSummary.kilometers}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  impactSummary: { ...prev.impactSummary, kilometers: parseInt(e.target.value) || 0 },
                }))
              }
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bikes">Bikes</Label>
            <Input
              id="bikes"
              type="number"
              min="0"
              value={formData.impactSummary.bikes}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  impactSummary: { ...prev.impactSummary, bikes: parseInt(e.target.value) || 0 },
                }))
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Story Content" description="Build the long-form content using blocks">
        <BlockEditor blocks={blocks} onChange={setBlocks} disabled={isReadOnly} />
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t bg-background">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={isSubmitting || isReadOnly} className="min-w-[160px]">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {mode === 'create' ? 'Create Story' : 'Update Story'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
