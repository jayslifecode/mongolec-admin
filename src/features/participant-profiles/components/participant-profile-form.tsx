'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
import { FormSection } from '@/components/admin'
import { sortRalliesByStartDateDesc, type RallyOption } from '../lib/rally-options'
import { validateParticipantForm } from '../lib/validation'
import type { ParticipantProfile } from '../types'
import { riderTierConfig } from '../types'

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
        toast.success('Participant created successfully')
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
        toast.success('Participant updated successfully')
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
      displayOrder: parseInt(formData.displayOrder) || 0,
      isActive: formData.isActive,
      slug: formData.slug,
      honoraryTitle: formData.honoraryTitle,
      rallyIds: formData.rallyIds,
    }

    const validation = validateParticipantForm(values)
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors)
      const firstError = Object.values(validation.fieldErrors)[0]
      setError(firstError ?? 'Please fix the errors below')
      toast.error(firstError ?? 'Please fix the errors below')
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

    const trimmedSlug = values.slug.trim()
    if (trimmedSlug) {
      input.slug = trimmedSlug
    }

    if (mode === 'create') {
      createParticipant({ variables: { input } })
    } else if (participantId) {
      updateParticipant({ variables: { id: participantId, input } })
    }
  }

  const tier = initialData?.tier

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Basic Information" description="Name and country details">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="First name"
              required
            />
            {fieldErrors.firstName && (
              <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Last name"
              required
            />
            {fieldErrors.lastName && (
              <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Country <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="E.g., Mongolia"
              required
            />
            {fieldErrors.country && (
              <p className="text-xs text-destructive">{fieldErrors.country}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        {mode === 'edit' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="Auto-generated by the backend"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from the name; override only if needed.
              </p>
            </div>
            {tier && (
              <div className="space-y-1.5">
                <Label>Computed Tier</Label>
                <div>
                  <Badge className={riderTierConfig[tier].className}>
                    {riderTierConfig[tier].label}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </FormSection>

      <FormSection title="Photo">
        <div className="space-y-1.5">
          <Label>Photo URL</Label>
          <Input
            value={formData.photo}
            onChange={(e) => handleChange('photo', e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />
        </div>
        {formData.photo && (
          <img
            src={formData.photo}
            alt="Preview"
            className="h-32 w-32 rounded-lg object-cover border mt-2"
          />
        )}
      </FormSection>

      <FormSection title="Biography">
        <Textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Enter biography"
          className="min-h-28"
        />
      </FormSection>

      <FormSection
        title="Rallies attended"
        description="Rallies this participant took part in"
      >
        <Popover open={rallyPopoverOpen} onOpenChange={setRallyPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
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
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedRallies.map((rally) => (
              <span
                key={rally.id}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-sm font-medium"
              >
                {rally.title} ({rally.year})
                <button
                  type="button"
                  onClick={() => removeRally(rally.id)}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
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

      <FormSection
        title="Honorary Title"
        description="Overrides the computed tier badge, e.g. Board Member"
      >
        <Input
          value={formData.honoraryTitle}
          onChange={(e) => handleChange('honoraryTitle', e.target.value)}
          placeholder="E.g., Board Member"
        />
        {fieldErrors.honoraryTitle && (
          <p className="text-xs text-destructive">{fieldErrors.honoraryTitle}</p>
        )}
      </FormSection>

      <FormSection title="Settings">
        <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Visible in the public participant listing
            </p>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'create' ? 'Add Participant' : 'Save Changes'}
          </Button>
          <Link href="/participant-profiles">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </form>
  )
}
