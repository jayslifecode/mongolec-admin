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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Loader2, X, ChevronsUpDown } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  CREATE_PARTICIPANT_PROFILE,
  UPDATE_PARTICIPANT_PROFILE,
} from '@/graphql/mutations/participant-profiles'
import { GET_RALLIES } from '@/graphql/queries/rallies'
import { FormField, FormSection } from '@/components/admin'
import { sortRalliesByStartDateDesc, type RallyOption } from '../lib/rally-options'
import { validateParticipantForm } from '../lib/validation'
import { SingleImageUpload } from '@/components/single-image-upload'
import type { ParticipantProfile } from '../types'

interface ParticipantProfileFormProps {
  mode: 'create' | 'edit'
  initialData?: ParticipantProfile
  participantId?: string
}

interface GetRalliesForSelectData {
  getRallies: {
    rallies: Array<{
      id: string
      title: string | { en: string; mn: string }
      startDate: string
    }>
  }
}

function getRallyDisplayTitle(title: string | { en: string; mn: string }): string {
  if (typeof title === 'string') return title
  return title.en || title.mn || ''
}

export function ParticipantProfileForm({
  mode,
  initialData,
  participantId,
}: ParticipantProfileFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [rallyPopoverOpen, setRallyPopoverOpen] = useState(false)

  const { data: ralliesData } = useQuery<GetRalliesForSelectData>(GET_RALLIES, {
    variables: { limit: 500, page: 1 },
  })

  const rallyOptions: RallyOption[] = useMemo(() => {
    const rallies = ralliesData?.getRallies?.rallies ?? []
    const mapped = rallies.map((rally) => ({
      id: rally.id,
      title: getRallyDisplayTitle(rally.title),
      year: new Date(rally.startDate).getFullYear(),
      startDate: rally.startDate,
    }))
    return sortRalliesByStartDateDesc(mapped)
  }, [ralliesData])

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName ?? '',
    lastName: initialData?.lastName ?? '',
    photo: initialData?.photo ?? '',
    country: initialData?.country ?? '',
    bio: initialData?.bio ?? '',
    displayOrder: initialData?.displayOrder?.toString() ?? '0',
    isActive: initialData?.isActive ?? true,
    slug: initialData?.slug ?? '',
    honoraryTitle: initialData?.honoraryTitle ?? '',
    rallyIds: initialData?.rallies?.map((link) => link.rally.id) ?? [],
  })

  const [createParticipant, { loading: createLoading }] = useMutation(
    CREATE_PARTICIPANT_PROFILE,
    {
      onCompleted: () => {
        toast.success('Rider added')
        router.push('/participant-profiles')
      },
      onError: (err) => {
        setError(err.message)
        toast.error(err.message)
      },
    },
  )

  const [updateParticipant, { loading: updateLoading }] = useMutation(
    UPDATE_PARTICIPANT_PROFILE,
    {
      onCompleted: () => {
        toast.success('Rider updated')
        router.push('/participant-profiles')
      },
      onError: (err) => {
        setError(err.message)
        toast.error(err.message)
      },
    },
  )

  const loading = createLoading || updateLoading

  const handleChange = (
    field: string,
    value: string | boolean | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleRally = (rallyId: string) => {
    const isSelected = formData.rallyIds.includes(rallyId)
    handleChange(
      'rallyIds',
      isSelected
        ? formData.rallyIds.filter((id) => id !== rallyId)
        : [...formData.rallyIds, rallyId],
    )
  }

  const removeRally = (rallyId: string) => {
    handleChange('rallyIds', formData.rallyIds.filter((id) => id !== rallyId))
  }

  const selectedRallies = formData.rallyIds
    .map((id) => rallyOptions.find((rally) => rally.id === id))
    .filter((rally): rally is RallyOption => Boolean(rally))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const values = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      photo: formData.photo,
      country: formData.country,
      bio: formData.bio,
      displayOrder: formData.displayOrder.trim() === '' ? 0 : Number(formData.displayOrder),
      isActive: formData.isActive,
      slug: formData.slug,
      honoraryTitle: formData.honoraryTitle,
      rallyIds: formData.rallyIds,
    }

    const validation = validateParticipantForm(values)
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors)
      setError(null)
      toast.error('Please fix the highlighted fields')
      const firstKey = Object.keys(validation.fieldErrors)[0]
      if (firstKey) document.getElementById(`rider-${firstKey}`)?.focus()
      return
    }
    setFieldErrors({})

    const input: Record<string, unknown> = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      photo: values.photo.trim() || null,
      country: values.country.trim(),
      bio: values.bio.trim() || null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
      honoraryTitle: values.honoraryTitle.trim() || null,
      rallyIds: values.rallyIds,
    }

    if (values.slug.trim()) {
      input.slug = values.slug.trim()
    }

    if (mode === 'create') {
      createParticipant({ variables: { input } })
    } else if (participantId) {
      updateParticipant({ variables: { id: participantId, input } })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Basic information" description="Name and country">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="rider-firstName" label="First name" required error={fieldErrors.firstName}>
            {(props) => (
              <Input
                {...props}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="First name"
                autoComplete="off"
              />
            )}
          </FormField>
          <FormField id="rider-lastName" label="Last name" required error={fieldErrors.lastName}>
            {(props) => (
              <Input
                {...props}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Last name"
                autoComplete="off"
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="rider-country" label="Country" required error={fieldErrors.country}>
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
            id="rider-displayOrder"
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

        {mode === 'edit' && (
          <FormField
            id="rider-slug"
            label="URL name"
            description="Made from the name automatically; change it only if needed. Lowercase letters, numbers and dashes."
            error={fieldErrors.slug}
          >
            {(props) => (
              <Input
                {...props}
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="jane-doe"
              />
            )}
          </FormField>
        )}
      </FormSection>

      <FormSection
        title="Featured photo"
        description="The main photo the rider is shown with on the website (use the portrait from their latest rally)."
      >
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Upload a photo</p>
          <SingleImageUpload
            key={formData.photo || 'empty'}
            initialUrl={formData.photo || undefined}
            autoUpload
            onUpload={(url) => handleChange('photo', url)}
          />
        </div>
        <FormField
          id="rider-photo"
          label="Or paste an image link"
          required
          error={fieldErrors.photo}
        >
          {(props) => (
            <Input
              {...props}
              type="url"
              value={formData.photo}
              onChange={(e) => handleChange('photo', e.target.value)}
              placeholder="https://..."
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Biography">
        <FormField id="rider-bio" label="Biography">
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

      <FormSection
        title="Rallies attended"
        description="Rallies this rider took part in"
      >
        <Label id="rider-rallies-label" className="sr-only">
          Rallies
        </Label>
        <Popover open={rallyPopoverOpen} onOpenChange={setRallyPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-labelledby="rider-rallies-label"
              aria-expanded={rallyPopoverOpen}
              className="w-full justify-between"
            >
              {formData.rallyIds.length > 0
                ? `${formData.rallyIds.length} rally${formData.rallyIds.length === 1 ? '' : ' rallies'} selected`
                : 'Select rallies…'}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search rallies…" />
              <CommandList>
                <CommandEmpty>No rallies found.</CommandEmpty>
                <CommandGroup>
                  {rallyOptions.map((rally) => {
                    const isSelected = formData.rallyIds.includes(rally.id)
                    return (
                      <CommandItem
                        key={rally.id}
                        value={`${rally.title} ${rally.year}`}
                        onSelect={() => toggleRally(rally.id)}
                      >
                        <Checkbox checked={isSelected} className="mr-2" />
                        {rally.title} ({rally.year})
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedRallies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedRallies.map((rally) => (
              <span
                key={rally.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-sm font-medium"
              >
                {rally.title} ({rally.year})
                <button
                  type="button"
                  onClick={() => removeRally(rally.id)}
                  aria-label={`Remove ${rally.title} (${rally.year})`}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2">
          {formData.rallyIds.length} rally{formData.rallyIds.length === 1 ? '' : ' rallies'}{' '}
          attended
        </p>
      </FormSection>

      <FormSection title="Honorary title" description="An optional special title, e.g. Board Member">
        <FormField id="rider-honoraryTitle" label="Title" error={fieldErrors.honoraryTitle}>
          {(props) => (
            <Input
              {...props}
              value={formData.honoraryTitle}
              onChange={(e) => handleChange('honoraryTitle', e.target.value)}
              placeholder="E.g., Board Member"
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Settings">
        <div className="border-border flex items-center justify-between rounded-lg border px-4 py-3">
          <div>
            <Label htmlFor="rider-isActive" className="text-sm font-medium">
              Active
            </Label>
            <p id="rider-isActive-description" className="text-muted-foreground mt-0.5 text-xs">
              Visible in the public rider listing
            </p>
          </div>
          <Switch
            id="rider-isActive"
            aria-describedby="rider-isActive-description"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t border-border bg-background">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'create' ? 'Add rider' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/participant-profiles">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
