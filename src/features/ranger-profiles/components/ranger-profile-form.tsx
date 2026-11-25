'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CREATE_RANGER_PROFILE, UPDATE_RANGER_PROFILE } from '@/graphql/mutations/ranger-profiles'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { FormField, FormSection } from '@/components/admin'
import { sortRalliesByStartDateDesc, type RallyOption } from '@/features/participant-profiles/lib/rally-options'
import { validateRangerForm } from '../lib/validation'
import type { RangerProfile } from '../types'

const NO_RALLY = 'none'
const RALLIES_PAGE_SIZE = 500

interface RangerProfileFormProps {
  mode: 'create' | 'edit'
  initialData?: RangerProfile
  rangerId?: string
}

interface GetRalliesData {
  getRallies: {
    rallies: Array<{ id: string; title: string | { en: string; mn: string }; startDate: string }>
  }
}

function rallyTitle(title: string | { en: string; mn: string }): string {
  return typeof title === 'string' ? title : title.en || title.mn || ''
}

export function RangerProfileForm({ mode, initialData, rangerId }: RangerProfileFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: ralliesData, loading: ralliesLoading } = useQuery<GetRalliesData>(GET_RALLIES, {
    variables: { limit: RALLIES_PAGE_SIZE, page: 1 },
  })

  const rallyOptions: RallyOption[] = useMemo(() => {
    const rallies = ralliesData?.getRallies?.rallies ?? []
    return sortRalliesByStartDateDesc(
      rallies.map((r) => ({
        id: r.id,
        title: rallyTitle(r.title),
        year: new Date(r.startDate).getFullYear(),
        startDate: r.startDate,
      })),
    )
  }, [ralliesData])

  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    photo: initialData?.photo ?? '',
    parkName: initialData?.parkName ?? '',
    country: initialData?.country ?? '',
    bio: initialData?.bio ?? '',
    displayOrder: initialData?.displayOrder?.toString() ?? '0',
    isActive: initialData?.isActive ?? true,
    rallyId: initialData?.rallyId ?? '',
  })

  const [createRanger, { loading: createLoading }] = useMutation(CREATE_RANGER_PROFILE, {
    onCompleted: () => {
      toast.success('Ranger added')
      router.push('/ranger-profiles')
    },
    onError: (err) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const [updateRanger, { loading: updateLoading }] = useMutation(UPDATE_RANGER_PROFILE, {
    onCompleted: () => {
      toast.success('Ranger updated')
      router.push('/ranger-profiles')
    },
    onError: (err) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const loading = createLoading || updateLoading

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const values = {
      name: formData.name,
      parkName: formData.parkName,
      country: formData.country,
      photo: formData.photo.trim(),
      bio: formData.bio,
      displayOrder: formData.displayOrder.trim() === '' ? 0 : Number(formData.displayOrder),
      isActive: formData.isActive,
      rallyId: formData.rallyId,
    }
    const knownIds = ralliesData ? rallyOptions.map((r) => r.id) : undefined
    const errors = validateRangerForm(values, knownIds)
    setFieldErrors(errors)
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      toast.error('Please fix the highlighted fields')
      document.getElementById(`ranger-${firstKey}`)?.focus()
      return
    }

    const input: Record<string, unknown> = {
      name: values.name.trim(),
      parkName: values.parkName.trim(),
      country: values.country.trim(),
      bio: values.bio.trim() || null,
      photo: values.photo || null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
      rallyId: values.rallyId || null,
    }

    if (mode === 'create') {
      createRanger({ variables: { input } })
    } else if (rangerId) {
      updateRanger({ variables: { id: rangerId, input } })
    }
  }

  // Keep a rally that no longer exists selectable, so saving does not silently drop it.
  const isUnknownRally = Boolean(formData.rallyId) && !!ralliesData && !rallyOptions.some((r) => r.id === formData.rallyId)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Basic information" description="Name, park and country">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="ranger-name" label="Name" required error={fieldErrors.name}>
            {(props) => (
              <Input
                {...props}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Full name"
              />
            )}
          </FormField>
          <FormField id="ranger-parkName" label="Park name" required error={fieldErrors.parkName}>
            {(props) => (
              <Input
                {...props}
                value={formData.parkName}
                onChange={(e) => handleChange('parkName', e.target.value)}
                placeholder="E.g., Hustai National Park"
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="ranger-country" label="Country" required error={fieldErrors.country}>
            {(props) => (
              <Input
                {...props}
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="E.g., Mongolia"
              />
            )}
          </FormField>
          <FormField
            id="ranger-displayOrder"
            label="Display order"
            description="Lower numbers are shown first."
            error={fieldErrors.displayOrder}
          >
            {(props) => (
              <Input
                {...props}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={formData.displayOrder}
                onChange={(e) => handleChange('displayOrder', e.target.value)}
                placeholder="0"
              />
            )}
          </FormField>
        </div>

        <FormField
          id="ranger-rallyId"
          label="Rally"
          description="Optional. The rally this ranger is linked to."
          error={fieldErrors.rallyId}
        >
          {({ id, ...props }) => (
            <Select
              value={formData.rallyId || NO_RALLY}
              onValueChange={(v) => handleChange('rallyId', v === NO_RALLY ? '' : v)}
              disabled={ralliesLoading}
            >
              <SelectTrigger id={id} {...props}>
                <SelectValue placeholder={ralliesLoading ? 'Loading rallies…' : 'No rally'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_RALLY}>No rally</SelectItem>
                {isUnknownRally && <SelectItem value={formData.rallyId}>Unknown rally (no longer exists)</SelectItem>}
                {rallyOptions.map((rally) => (
                  <SelectItem key={rally.id} value={rally.id}>
                    {rally.title} ({rally.year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
      </FormSection>

      <FormSection title="Photo">
        <FormField
          id="ranger-photo"
          label="Photo link"
          description="A full link starting with https://"
          error={fieldErrors.photo}
        >
          {(props) => (
            <Input
              {...props}
              type="url"
              value={formData.photo}
              onChange={(e) => handleChange('photo', e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          )}
        </FormField>
        {formData.photo && !fieldErrors.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={formData.photo}
            alt="Preview of the ranger photo"
            className="border-border h-32 w-32 rounded-lg border object-cover"
          />
        )}
      </FormSection>

      <FormSection title="Biography">
        <FormField id="ranger-bio" label="Biography">
          {(props) => (
            <Textarea
              {...props}
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Enter biography"
              className="min-h-28"
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Settings">
        <div className="border-border flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <Label htmlFor="ranger-isActive" className="text-sm font-medium">
              Active
            </Label>
            <p id="ranger-isActive-description" className="text-muted-foreground mt-0.5 text-xs">
              Visible in the public ranger listing
            </p>
          </div>
          <Switch
            id="ranger-isActive"
            aria-describedby="ranger-isActive-description"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
      </FormSection>

      <div className="border-border bg-background sticky bottom-0 z-10 border-t">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'create' ? 'Add ranger' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/ranger-profiles">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
