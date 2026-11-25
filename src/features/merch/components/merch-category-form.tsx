'use client'

import { useState } from 'react'
import { useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import { CREATE_MERCH_CATEGORY, UPDATE_MERCH_CATEGORY } from '@/graphql/mutations/merch'
import { GET_MERCH_CATEGORIES } from '@/graphql/queries/merch'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FormField, FormSection } from '@/components/admin'
import { firstErrorLanguage, merchCategorySchema, type MerchCategoryFormData } from '../lib/category-schema'

type LangField = string | { en?: string; mn?: string } | null | undefined

interface MerchCategoryInitialData {
  id: string
  name?: LangField
  slug?: string
  description?: LangField
}

interface MerchCategoryFormProps {
  mode?: 'create' | 'edit'
  categoryId?: string
  initialData?: MerchCategoryInitialData
}

const normalizeLangField = (field: LangField): { en: string; mn: string } => {
  if (!field) return { en: '', mn: '' }
  if (typeof field === 'string') return { en: field, mn: field }
  return { en: field.en || '', mn: field.mn || '' }
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export function MerchCategoryForm({ mode = 'create', categoryId, initialData }: MerchCategoryFormProps) {
  const router = useRouter()
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'mn'>('en')

  const initialName = normalizeLangField(initialData?.name)
  const initialDescription = normalizeLangField(initialData?.description)

  const refetchQueries = [{ query: GET_MERCH_CATEGORIES, variables: { language: 'en' } }]
  const [createCategory, { loading: creating }] = useMutation(CREATE_MERCH_CATEGORY, { refetchQueries })
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_MERCH_CATEGORY, { refetchQueries })
  const loading = creating || updating

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<MerchCategoryFormData>({
    resolver: zodResolver(merchCategorySchema),
    defaultValues: {
      name_en: initialName.en,
      name_mn: initialName.mn,
      slug: initialData?.slug || '',
      description_en: initialDescription.en,
      description_mn: initialDescription.mn,
    },
  })

  const onInvalid = (fieldErrors: FieldErrors<MerchCategoryFormData>) => {
    const keys = Object.keys(fieldErrors)
    const language = firstErrorLanguage(keys)
    // An error in the hidden language tab would otherwise fail silently: show that tab.
    if (language) setActiveLanguage(language)
    const first = keys[0] as keyof MerchCategoryFormData | undefined
    if (first) setTimeout(() => setFocus(first), 0)
  }

  const onSubmit = async (data: MerchCategoryFormData) => {
    const input = {
      name: { en: data.name_en, mn: data.name_mn },
      slug: data.slug,
      description: { en: data.description_en || '', mn: data.description_mn || '' },
    }
    try {
      if (mode === 'edit' && categoryId) {
        await updateCategory({ variables: { id: categoryId, input } })
        toast.success('Category updated successfully')
      } else {
        await createCategory({ variables: { input } })
        toast.success('Category created successfully')
      }
      router.push('/merch/categories')
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Failed to save category')
    }
  }

  const langLabel = activeLanguage === 'en' ? 'English' : 'Mongolian'
  const nameKey = `name_${activeLanguage}` as const
  const descriptionKey = `description_${activeLanguage}` as const
  const hiddenErrorLanguage = activeLanguage === 'en' ? 'Mongolian' : 'English'
  const hasHiddenError = !!errors[activeLanguage === 'en' ? 'name_mn' : 'name_en']

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
      <FormSection
        title="Category Information"
        description="Name, slug, and description for this category"
        actions={
          <Tabs value={activeLanguage} onValueChange={(v) => setActiveLanguage(v as 'en' | 'mn')}>
            <TabsList className="h-7 text-xs" aria-label="Content language">
              <TabsTrigger value="en" className="text-xs px-2.5 h-5.5">English</TabsTrigger>
              <TabsTrigger value="mn" className="text-xs px-2.5 h-5.5">Монгол</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        {hasHiddenError && (
          <p role="alert" className="text-destructive text-sm">
            The {hiddenErrorLanguage} name needs attention. Switch tabs to fix it.
          </p>
        )}
        <FormField id={nameKey} label={`Name (${langLabel})`} required error={errors[nameKey]?.message}>
          {(control) => (
            <Input
              {...control}
              {...register(nameKey)}
              placeholder={activeLanguage === 'en' ? 'Enter category name' : 'Ангиллын нэр'}
              onBlur={(e) => {
                register(nameKey).onBlur(e)
                if (activeLanguage === 'en' && !watch('slug')) setValue('slug', generateSlug(e.target.value))
              }}
            />
          )}
        </FormField>

        <FormField
          id="slug"
          label="URL name (slug)"
          required
          error={errors.slug?.message}
          description="Lowercase letters, numbers and dashes. Filled in from the English name."
        >
          {(control) => <Input {...control} {...register('slug')} placeholder="category-url-name" />}
        </FormField>

        <FormField id={descriptionKey} label={`Description (${langLabel})`} error={errors[descriptionKey]?.message}>
          {(control) => (
            <Textarea
              {...control}
              {...register(descriptionKey)}
              placeholder={activeLanguage === 'en' ? 'Brief description of the category' : 'Ангиллын тайлбар'}
              rows={3}
            />
          )}
        </FormField>
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t bg-background">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {mode === 'edit' ? 'Update Category' : 'Create Category'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
