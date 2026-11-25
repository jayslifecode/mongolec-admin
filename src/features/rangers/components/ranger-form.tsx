'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CREATE_PARK_PARTNERSHIP, UPDATE_PARK_PARTNERSHIP } from '@/graphql/mutations/rangers'
import { FormField, FormSection } from '@/components/admin'
import { validateParkPartnerForm } from '../lib/validation'
import type { ParkPartnership } from '../types'

interface RangerFormProps {
  mode: 'create' | 'edit'
  language: 'en' | 'mn'
  initialData?: ParkPartnership
  rangerId?: string
  /** Lets the form switch the page's language tab to the one that holds an error. */
  onLanguageChange?: (language: 'en' | 'mn') => void
}

const normalizeLangField = (field: string | { en: string; mn: string } | undefined) => {
  if (!field) return { en: '', mn: '' }
  if (typeof field === 'string') return { en: field, mn: '' }
  return field
}

export function RangerForm({ mode, language, initialData, rangerId, onLanguageChange }: RangerFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    parkName: normalizeLangField(initialData?.parkName),
    country: initialData?.country || '',
    location: normalizeLangField(initialData?.location),
    establishedDate: initialData?.establishedDate || '',
    partnershipType: normalizeLangField(initialData?.partnershipType),
    rangersCount: initialData?.rangersCount?.toString() || '0',
    areaSize: normalizeLangField(initialData?.areaSize),
    keyChallenges: normalizeLangField(initialData?.keyChallenges),
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
  })

  const [createPartnership, { loading: createLoading }] = useMutation(CREATE_PARK_PARTNERSHIP, {
    onCompleted: () => {
      toast.success('Park partner added')
      router.push('/rangers')
    },
    onError: (err) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const [updatePartnership, { loading: updateLoading }] = useMutation(UPDATE_PARK_PARTNERSHIP, {
    onCompleted: () => {
      toast.success('Park partner updated')
      router.push('/rangers')
    },
    onError: (err) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const loading = createLoading || updateLoading

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLangFieldChange = (field: string, value: string) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as { en: string; mn: string }
      return { ...prev, [field]: { ...current, [language]: value } }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const rangersCount = formData.rangersCount.trim() === '' ? 0 : Number(formData.rangersCount)
    const errors = validateParkPartnerForm({
      parkName: formData.parkName,
      country: formData.country,
      rangersCount,
      contactEmail: formData.contactEmail.trim(),
      contactPhone: formData.contactPhone.trim(),
    })
    setFieldErrors(errors)
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      toast.error('Please fix the highlighted fields')
      if (firstKey === 'parkName.en' && language !== 'en') {
        onLanguageChange?.('en')
        setError('The park name is missing in English. Switched to the English tab.')
      }
      const targetId = `partner-${firstKey.split('.')[0]}`
      // Wait a tick so the English tab is mounted before focusing.
      setTimeout(() => document.getElementById(targetId)?.focus(), 0)
      return
    }

    const input = {
      parkName: { en: formData.parkName.en.trim(), mn: formData.parkName.mn.trim() },
      country: formData.country.trim(),
      location: formData.location,
      establishedDate: formData.establishedDate || null,
      partnershipType: formData.partnershipType,
      rangersCount,
      areaSize: formData.areaSize.en || formData.areaSize.mn ? formData.areaSize : null,
      keyChallenges: formData.keyChallenges.en || formData.keyChallenges.mn ? formData.keyChallenges : null,
      contactPerson: formData.contactPerson.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      contactPhone: formData.contactPhone.trim() || null,
    }

    if (mode === 'create') {
      createPartnership({ variables: { data: input } })
    } else if (rangerId) {
      updatePartnership({ variables: { id: rangerId, data: input } })
    }
  }

  const ph = (en: string, mn: string) => (language === 'en' ? en : mn)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Basic information">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="partner-parkName"
            label={`Park name (${language.toUpperCase()})`}
            required
            description={language === 'mn' ? 'The English name is required.' : undefined}
            error={language === 'en' ? fieldErrors['parkName.en'] : undefined}
          >
            {(props) => (
              <Input
                {...props}
                value={formData.parkName[language]}
                onChange={(e) => handleLangFieldChange('parkName', e.target.value)}
                placeholder={ph('Park name in English', 'Паркийн нэр')}
              />
            )}
          </FormField>
          <FormField id="partner-country" label="Country" required error={fieldErrors.country}>
            {(props) => (
              <Input
                {...props}
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter country"
              />
            )}
          </FormField>
          <FormField id="partner-establishedDate" label="Established date">
            {(props) => (
              <Input
                {...props}
                type="date"
                value={formData.establishedDate}
                onChange={(e) => handleInputChange('establishedDate', e.target.value)}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Location and partnership">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="partner-location" label={`Location (${language.toUpperCase()})`}>
            {(props) => (
              <Input
                {...props}
                value={formData.location[language]}
                onChange={(e) => handleLangFieldChange('location', e.target.value)}
                placeholder={ph('Location in English', 'Байршил')}
              />
            )}
          </FormField>
          <FormField id="partner-partnershipType" label={`Partnership type (${language.toUpperCase()})`}>
            {(props) => (
              <Input
                {...props}
                value={formData.partnershipType[language]}
                onChange={(e) => handleLangFieldChange('partnershipType', e.target.value)}
                placeholder={ph('E.g., National Park, Reserve', 'Түнш төрөл')}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Area and rangers">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="partner-areaSize" label={`Area size (${language.toUpperCase()})`}>
            {(props) => (
              <Input
                {...props}
                value={formData.areaSize[language]}
                onChange={(e) => handleLangFieldChange('areaSize', e.target.value)}
                placeholder={ph('E.g., 50,000 km²', '50,000 км²')}
              />
            )}
          </FormField>
          <FormField id="partner-rangersCount" label="Number of rangers" error={fieldErrors.rangersCount}>
            {(props) => (
              <Input
                {...props}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={formData.rangersCount}
                onChange={(e) => handleInputChange('rangersCount', e.target.value)}
                placeholder="0"
              />
            )}
          </FormField>
        </div>

        <FormField id="partner-keyChallenges" label={`Key challenges (${language.toUpperCase()})`}>
          {(props) => (
            <Textarea
              {...props}
              value={formData.keyChallenges[language]}
              onChange={(e) => handleLangFieldChange('keyChallenges', e.target.value)}
              placeholder={ph('Describe key challenges', 'Гол сорилтууд')}
              className="min-h-24"
            />
          )}
        </FormField>
      </FormSection>

      <FormSection title="Contact person">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="partner-contactPerson" label="Name" className="sm:col-span-2">
            {(props) => (
              <Input
                {...props}
                value={formData.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                placeholder="Contact person name"
                className="max-w-sm"
              />
            )}
          </FormField>
          <FormField id="partner-contactEmail" label="Email" error={fieldErrors.contactEmail}>
            {(props) => (
              <Input
                {...props}
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="email@example.com"
              />
            )}
          </FormField>
          <FormField id="partner-contactPhone" label="Phone" error={fieldErrors.contactPhone}>
            {(props) => (
              <Input
                {...props}
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="+976 ..."
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <div className="border-border bg-background sticky bottom-0 z-10 border-t">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'create' ? 'Add park partner' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/rangers">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
