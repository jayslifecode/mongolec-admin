'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { SerializedEditorState } from 'lexical'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Editor } from '@/components/blocks/editor-00/editor'
import { FormField, FormSection, PageHeader, StatusBadge } from '@/components/admin'
import { QueryErrorState } from '@/components/query-error-state'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { CREATE_NEWS_ARTICLE, UPDATE_NEWS_ARTICLE } from '@/graphql/mutations/news'
import { GET_NEWS_ARTICLE_BY_ID, GET_NEWS_CATEGORIES } from '@/graphql/queries/news'
import { validateArticleForm } from '../lib/article-schema'

const initialEditorState = {
  root: {
    children: [
      {
        children: [],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
} as unknown as SerializedEditorState

interface NewsArticleFormData {
  title_en: string
  title_mn: string
  slug: string
  excerpt_en: string
  excerpt_mn: string
  subtitle_en: string
  subtitle_mn: string
  featuredImage: string
  socialImage: string
  categoryId: string
  location_en: string
  location_mn: string
  source: string
  byline_en: string
  byline_mn: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'BREAKING'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED'
  isBreaking: boolean
  isFeatured: boolean
  metaTitle_en: string
  metaTitle_mn: string
  metaDescription_en: string
  metaDescription_mn: string
  keywords_en: string
  keywords_mn: string
  publishedAt: string
  scheduledAt: string
}

const EMPTY_FORM: NewsArticleFormData = {
  title_en: '', title_mn: '', slug: '', excerpt_en: '', excerpt_mn: '', subtitle_en: '', subtitle_mn: '',
  featuredImage: '', socialImage: '', categoryId: '', location_en: '', location_mn: '', source: '',
  byline_en: '', byline_mn: '', priority: 'NORMAL', status: 'DRAFT', isBreaking: false, isFeatured: false,
  metaTitle_en: '', metaTitle_mn: '', metaDescription_en: '', metaDescription_mn: '', keywords_en: '',
  keywords_mn: '', publishedAt: '', scheduledAt: '',
}

interface RawArticle {
  id: string
  slug?: string
  title?: string
  subtitle?: string
  excerpt?: string
  byline?: string
  location?: string
  source?: string
  featuredImage?: string
  socialImage?: string
  status?: string
  priority?: string
  isBreaking?: boolean
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
  keywords?: string | string[]
  blocks?: unknown
  publishedAt?: string | null
  scheduledAt?: string | null
  category?: { id: string; name: string } | null
}

interface NewsArticleFormBlockNoteProps {
  mode?: 'create' | 'edit'
  articleId?: string
}

const STATUS_TONES = { DRAFT: 'neutral', PUBLISHED: 'success', SCHEDULED: 'warning', ARCHIVED: 'neutral' } as const

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

export function NewsArticleFormBlockNote({ mode = 'create', articleId }: NewsArticleFormBlockNoteProps) {
  const router = useRouter()
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'mn'>('en')
  const [contentEn, setContentEn] = useState<SerializedEditorState>(initialEditorState)
  const [contentMn, setContentMn] = useState<SerializedEditorState>(initialEditorState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  // In edit mode the form (and its editors) only mounts once the article has been loaded into it.
  const [isHydrated, setIsHydrated] = useState(mode === 'create')

  const [createArticle, { loading: creating }] = useMutation(CREATE_NEWS_ARTICLE)
  const [updateArticle, { loading: updating }] = useMutation(UPDATE_NEWS_ARTICLE, {
    refetchQueries: ['GetNewsArticleById'],
  })

  const isEdit = mode === 'edit' && !!articleId
  const enQuery = useQuery<{ getNewsArticleById: RawArticle | null }>(GET_NEWS_ARTICLE_BY_ID, {
    variables: { id: articleId, language: 'en' },
    skip: !isEdit,
  })
  const mnQuery = useQuery<{ getNewsArticleById: RawArticle | null }>(GET_NEWS_ARTICLE_BY_ID, {
    variables: { id: articleId, language: 'mn' },
    skip: !isEdit,
  })
  const { data: categoriesData } = useQuery<{ getNewsCategories: Array<{ id: string; name: string }> }>(
    GET_NEWS_CATEGORIES,
    { variables: { language: 'en' } }
  )
  const categories = categoriesData?.getNewsCategories ?? []

  const isSubmitting = creating || updating

  const { register, getValues, setValue, reset, watch } = useForm<NewsArticleFormData>({
    defaultValues: EMPTY_FORM,
  })

  const articleData = enQuery.data
  const articleDataMn = mnQuery.data

  useEffect(() => {
    const en = articleData?.getNewsArticleById
    const mn = articleDataMn?.getNewsArticleById
    if (!en || !mn) return

    const status = (en.status?.toUpperCase() ?? 'DRAFT') as NewsArticleFormData['status']
    const priority = (en.priority?.toUpperCase() ?? 'NORMAL') as NewsArticleFormData['priority']

    reset({
      title_en: en.title ?? '',
      title_mn: mn.title ?? '',
      slug: en.slug ?? '',
      excerpt_en: en.excerpt ?? '',
      excerpt_mn: mn.excerpt ?? '',
      subtitle_en: en.subtitle ?? '',
      subtitle_mn: mn.subtitle ?? '',
      byline_en: en.byline ?? '',
      byline_mn: mn.byline ?? '',
      location_en: en.location ?? '',
      location_mn: mn.location ?? '',
      source: en.source ?? '',
      featuredImage: en.featuredImage ?? '',
      socialImage: en.socialImage ?? '',
      categoryId: en.category?.id ?? '',
      priority,
      status,
      isBreaking: en.isBreaking ?? false,
      isFeatured: en.isFeatured ?? false,
      metaTitle_en: en.metaTitle ?? '',
      metaTitle_mn: mn.metaTitle ?? '',
      metaDescription_en: en.metaDescription ?? '',
      metaDescription_mn: mn.metaDescription ?? '',
      keywords_en: Array.isArray(en.keywords) ? en.keywords.join(', ') : (en.keywords ?? ''),
      keywords_mn: Array.isArray(mn.keywords) ? mn.keywords.join(', ') : (mn.keywords ?? ''),
      publishedAt: en.publishedAt ? new Date(en.publishedAt).toISOString().slice(0, 16) : '',
      scheduledAt: en.scheduledAt ? new Date(en.scheduledAt).toISOString().slice(0, 16) : '',
    })

    if (en.blocks) {
      try {
        const blocksEn = typeof en.blocks === 'string' ? JSON.parse(en.blocks) : en.blocks
        if (blocksEn?.en) setContentEn(blocksEn.en)
        else if (blocksEn?.root) setContentEn(blocksEn)
      } catch {
        toast.error('The English article content could not be read and will appear empty.')
      }
    }
    if (mn.blocks) {
      try {
        const blocksMn = typeof mn.blocks === 'string' ? JSON.parse(mn.blocks) : mn.blocks
        if (blocksMn?.mn) setContentMn(blocksMn.mn)
        else if (blocksMn?.root) setContentMn(blocksMn)
      } catch {
        toast.error('The Mongolian article content could not be read and will appear empty.')
      }
    }
    setIsHydrated(true)
  }, [articleData, articleDataMn, reset])

  const watchedStatus = watch('status')
  const watchedPriority = watch('priority')
  const watchedIsBreaking = watch('isBreaking')
  const watchedIsFeatured = watch('isFeatured')
  const watchedCategoryId = watch('categoryId')

  const buildInput = (data: NewsArticleFormData) => ({
    title: { en: data.title_en.trim(), mn: data.title_mn.trim() },
    slug: data.slug.trim(),
    excerpt: { en: data.excerpt_en, mn: data.excerpt_mn },
    subtitle: { en: data.subtitle_en, mn: data.subtitle_mn },
    byline: { en: data.byline_en, mn: data.byline_mn },
    blocks: { en: contentEn, mn: contentMn },
    featuredImage: data.featuredImage.trim() || undefined,
    socialImage: data.socialImage.trim() || undefined,
    categoryId: data.categoryId || undefined,
    location: { en: data.location_en, mn: data.location_mn },
    source: data.source || undefined,
    priority: data.priority.toLowerCase(),
    status: data.status.toLowerCase(),
    isBreaking: data.isBreaking,
    isFeatured: data.isFeatured,
    metaTitle: { en: data.metaTitle_en, mn: data.metaTitle_mn },
    metaDescription: { en: data.metaDescription_en, mn: data.metaDescription_mn },
    keywords: {
      en: data.keywords_en.split(',').map((k) => k.trim()).filter(Boolean),
      mn: data.keywords_mn.split(',').map((k) => k.trim()).filter(Boolean),
    },
    publishedAt: data.publishedAt || undefined,
    scheduledAt: data.scheduledAt || undefined,
  })

  /** Validates every field of both languages, saves, and reports the outcome. `status` overrides the select (Save as Draft). */
  const save = async (status?: NewsArticleFormData['status']) => {
    if (status) setValue('status', status)
    const data = { ...getValues(), ...(status ? { status } : {}) }

    const { fieldErrors, firstErrorLanguage } = validateArticleForm(data)
    setErrors(fieldErrors)
    const firstKey = Object.keys(fieldErrors)[0]
    if (firstKey) {
      // An error in the hidden language tab would otherwise fail silently: show that tab.
      if (firstErrorLanguage) setActiveLanguage(firstErrorLanguage)
      toast.error('Some fields need attention. Check the highlighted fields.')
      setTimeout(() => document.getElementById(firstKey)?.focus(), 0)
      return
    }

    const input = buildInput(data)
    try {
      if (mode === 'create') {
        const result = await createArticle({ variables: { input } })
        const created = (result.data as { createNewsArticle: { id: string } } | null | undefined)?.createNewsArticle
        toast.success(status === 'DRAFT' ? 'Draft saved' : 'Article created')
        router.push(created ? `/news/${created.id}/edit` : '/news')
      } else {
        await updateArticle({ variables: { id: articleId, input } })
        toast.success(status === 'DRAFT' ? 'Saved as draft' : 'Article updated')
      }
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to save the article'))
    }
  }

  const fieldKey = (base: string) => `${base}_${activeLanguage}` as keyof NewsArticleFormData

  if (isEdit && (enQuery.error || mnQuery.error)) {
    return (
      <QueryErrorState
        title="Couldn't load this article"
        message={(enQuery.error ?? mnQuery.error)?.message ?? 'Something went wrong.'}
        onRetry={() => void Promise.all([enQuery.refetch(), mnQuery.refetch()])}
      />
    )
  }
  if (isEdit && !isHydrated) {
    const notFound = !enQuery.loading && !mnQuery.loading && !enQuery.data?.getNewsArticleById
    return notFound ? (
      <QueryErrorState title="Article not found" message="It may have been deleted." />
    ) : (
      <div className='space-y-4' role='status' aria-label='Loading article'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  const lang = activeLanguage === 'en' ? 'English' : 'Mongolian'
  const hasHiddenLanguageError = Object.keys(errors).some((k) => k.endsWith(activeLanguage === 'en' ? '_mn' : '_en'))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className='space-y-6'
      noValidate
    >
      <PageHeader
        title={mode === 'create' ? 'New Article' : 'Edit Article'}
        backHref='/news'
        lang={activeLanguage}
        onLangChange={setActiveLanguage}
      />

      {hasHiddenLanguageError && (
        <p role='alert' className='text-destructive text-sm'>
          The {activeLanguage === 'en' ? 'Mongolian' : 'English'} text needs attention. Switch language to fix it.
        </p>
      )}

      {/* Main two-column layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]'>

        {/* Left column */}
        <div className='space-y-6'>

          {/* Article Details */}
          <FormSection title={`Article Details · ${lang}`}>
              <FormField id={fieldKey('title')} label='Title' required error={errors[fieldKey('title')]}>
                {(control) => (
                  <Input
                    {...control}
                    {...register(fieldKey('title') as 'title_en')}
                    placeholder={activeLanguage === 'en' ? 'Enter article title' : 'Нийтлэлийн гарчиг'}
                    onBlur={(e) => {
                      register(fieldKey('title') as 'title_en').onBlur(e)
                      if (activeLanguage === 'en' && !getValues('slug')) {
                        setValue('slug', generateSlug(e.target.value))
                      }
                    }}
                  />
                )}
              </FormField>

              <FormField id={fieldKey('subtitle')} label='Subtitle'>
                {(control) => (
                  <Input
                    {...control}
                    {...register(fieldKey('subtitle') as 'subtitle_en')}
                    placeholder={activeLanguage === 'en' ? 'Article subtitle' : 'Дэд гарчиг'}
                  />
                )}
              </FormField>

              <FormField
                id='slug'
                label='URL name (slug)'
                required
                error={errors.slug}
                description='Lowercase letters, numbers and dashes. Filled in from the English title.'
              >
                {(control) => (
                  <div className='flex'>
                    <span className='inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground'>
                      /news/
                    </span>
                    <Input
                      {...control}
                      {...register('slug')}
                      placeholder='article-url-slug'
                      className='rounded-l-none font-mono text-sm'
                    />
                  </div>
                )}
              </FormField>

              <FormField id={fieldKey('excerpt')} label='Excerpt'>
                {(control) => (
                  <Textarea
                    {...control}
                    {...register(fieldKey('excerpt') as 'excerpt_en')}
                    placeholder={activeLanguage === 'en' ? 'Brief summary for article previews' : 'Товч агуулга'}
                    rows={3}
                    className='resize-none'
                  />
                )}
              </FormField>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField id={fieldKey('byline')} label='Byline'>
                  {(control) => (
                    <Input
                      {...control}
                      {...register(fieldKey('byline') as 'byline_en')}
                      placeholder={activeLanguage === 'en' ? 'By Jane Smith' : 'Зохиогч: Б. Болд'}
                    />
                  )}
                </FormField>
                <FormField id={fieldKey('location')} label='Location'>
                  {(control) => (
                    <Input
                      {...control}
                      {...register(fieldKey('location') as 'location_en')}
                      placeholder={activeLanguage === 'en' ? 'Ulaanbaatar, Mongolia' : 'Улаанбаатар'}
                    />
                  )}
                </FormField>
              </div>

              <FormField id='source' label='Source'>
                {(control) => (
                  <Input {...control} {...register('source')} placeholder='Reuters, AP, Original…' />
                )}
              </FormField>
          </FormSection>

          {/* Article Content */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Article Content · {lang}</Label>
            <div className='rounded-md border overflow-hidden'>
              {activeLanguage === 'en' ? (
                <Editor
                  editorSerializedState={contentEn}
                  onSerializedChange={setContentEn}
                />
              ) : (
                <Editor
                  editorSerializedState={contentMn}
                  onSerializedChange={setContentMn}
                />
              )}
            </div>
          </div>

          {/* SEO */}
          <FormSection title={`SEO & Social · ${lang}`}>
              <FormField id={fieldKey('metaTitle')} label='Meta title' error={errors[fieldKey('metaTitle')]} description='60 characters at most.'>
                {(control) => (
                  <Input
                    {...control}
                    {...register(fieldKey('metaTitle') as 'metaTitle_en')}
                    placeholder={activeLanguage === 'en' ? 'SEO title' : 'SEO гарчиг'}
                  />
                )}
              </FormField>

              <FormField id={fieldKey('metaDescription')} label='Meta description' error={errors[fieldKey('metaDescription')]} description='160 characters at most.'>
                {(control) => (
                  <Textarea
                    {...control}
                    {...register(fieldKey('metaDescription') as 'metaDescription_en')}
                    placeholder={activeLanguage === 'en' ? 'SEO description' : 'SEO тайлбар'}
                    rows={3}
                    className='resize-none'
                  />
                )}
              </FormField>

              <FormField id={fieldKey('keywords')} label='Keywords' description='Separate with commas.'>
                {(control) => (
                  <Input
                    {...control}
                    {...register(fieldKey('keywords') as 'keywords_en')}
                    placeholder={activeLanguage === 'en' ? 'ecology, mongolia, conservation' : 'экологи, монгол'}
                    className='font-mono text-sm'
                  />
                )}
              </FormField>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <FormField id='featuredImage' label='Featured image link' error={errors.featuredImage}>
                  {(control) => (
                    <Input {...control} {...register('featuredImage')} placeholder='https://…' className='text-sm' inputMode='url' />
                  )}
                </FormField>
                <FormField id='socialImage' label='Social / OG image link' error={errors.socialImage}>
                  {(control) => (
                    <Input {...control} {...register('socialImage')} placeholder='https://…' className='text-sm' inputMode='url' />
                  )}
                </FormField>
              </div>
          </FormSection>
        </div>

        {/* Right sidebar */}
        <div className='space-y-4'>

          {/* Publish */}
          <FormSection title='Publish'>
              <div className='space-y-1.5'>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={watchedStatus}
                  onValueChange={(v) => setValue('status', v as NewsArticleFormData['status'])}
                >
                  <SelectTrigger id='status' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='DRAFT'>Draft</SelectItem>
                    <SelectItem value='PUBLISHED'>Published</SelectItem>
                    <SelectItem value='SCHEDULED'>Scheduled</SelectItem>
                    <SelectItem value='ARCHIVED'>Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='priority'>Priority</Label>
                <Select
                  value={watchedPriority}
                  onValueChange={(v) => setValue('priority', v as NewsArticleFormData['priority'])}
                >
                  <SelectTrigger id='priority' className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='LOW'>Low</SelectItem>
                    <SelectItem value='NORMAL'>Normal</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='URGENT'>Urgent</SelectItem>
                    <SelectItem value='BREAKING'>Breaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='categoryId'>Category</Label>
                <Select
                  value={watchedCategoryId || 'none'}
                  onValueChange={(v) => setValue('categoryId', v === 'none' ? '' : v)}
                >
                  <SelectTrigger id='categoryId' className='w-full'>
                    <SelectValue placeholder='No category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {watchedStatus === 'PUBLISHED' && (
                <FormField id='publishedAt' label='Published at'>
                  {(control) => (
                    <Input {...control} type='datetime-local' {...register('publishedAt')} className='text-sm' />
                  )}
                </FormField>
              )}
              {watchedStatus === 'SCHEDULED' && (
                <FormField id='scheduledAt' label='Scheduled at' required error={errors.scheduledAt}>
                  {(control) => (
                    <Input {...control} type='datetime-local' {...register('scheduledAt')} className='text-sm' />
                  )}
                </FormField>
              )}
          </FormSection>

          {/* Flags */}
          <FormSection title='Article Flags'>
              <div className='flex items-center justify-between gap-3'>
                <div className='space-y-0.5'>
                  <Label htmlFor='isBreaking'>Breaking news</Label>
                  <p className='text-xs text-muted-foreground'>Mark as urgent, top story</p>
                </div>
                <Switch
                  id='isBreaking'
                  checked={watchedIsBreaking}
                  onCheckedChange={(v) => setValue('isBreaking', v)}
                />
              </div>
              <div className='flex items-center justify-between gap-3'>
                <div className='space-y-0.5'>
                  <Label htmlFor='isFeatured'>Featured</Label>
                  <p className='text-xs text-muted-foreground'>Show on homepage highlight</p>
                </div>
                <Switch
                  id='isFeatured'
                  checked={watchedIsFeatured}
                  onCheckedChange={(v) => setValue('isFeatured', v)}
                />
              </div>
          </FormSection>

          {/* Status summary */}
          <div className='flex flex-wrap gap-2'>
            <StatusBadge tone={STATUS_TONES[watchedStatus]}>{watchedStatus}</StatusBadge>
            {watchedIsBreaking && <StatusBadge tone='danger'>Breaking</StatusBadge>}
            {watchedIsFeatured && <StatusBadge>Featured</StatusBadge>}
          </div>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className='sticky bottom-0 z-10 border-t bg-background'>
        <div className='flex items-center justify-end gap-2 py-4'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => void save('DRAFT')}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button type='submit' size='sm' disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
                Saving…
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' aria-hidden='true' />
                {mode === 'create' ? 'Create Article' : 'Update Article'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
