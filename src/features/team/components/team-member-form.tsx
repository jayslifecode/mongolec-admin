'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { CREATE_TEAM_MEMBER, UPDATE_TEAM_MEMBER } from '@/graphql/mutations/team'
import { FormField, FormSection } from '@/components/admin'
import { validateTeamMemberForm } from '../lib/validation'
import type { TeamMember } from '../types'

interface TeamMemberFormProps {
  mode: 'create' | 'edit'
  initialData?: TeamMember
  memberId?: string
}

export function TeamMemberForm({ mode, initialData, memberId }: TeamMemberFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.role || '',
    bio: initialData?.bio || '',
    photo: initialData?.photo || '',
    email: initialData?.email || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    twitterUrl: initialData?.twitterUrl || '',
    displayOrder: initialData?.displayOrder?.toString() || '0',
    isActive: initialData?.isActive ?? true,
  })

  const [createMember, { loading: createLoading }] = useMutation(CREATE_TEAM_MEMBER, {
    onCompleted: () => {
      toast.success('Team member added')
      router.push('/team')
    },
    onError: (err) => {
      setError(err.message)
      toast.error(err.message)
    },
  })

  const [updateMember, { loading: updateLoading }] = useMutation(UPDATE_TEAM_MEMBER, {
    onCompleted: () => {
      toast.success('Team member updated')
      router.push('/team')
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
      role: formData.role,
      bio: formData.bio,
      photo: formData.photo.trim(),
      email: formData.email.trim(),
      linkedinUrl: formData.linkedinUrl.trim(),
      twitterUrl: formData.twitterUrl.trim(),
      displayOrder: formData.displayOrder.trim() === '' ? 0 : Number(formData.displayOrder),
      isActive: formData.isActive,
    }
    const errors = validateTeamMemberForm(values)
    setFieldErrors(errors)
    const firstKey = Object.keys(errors)[0]
    if (firstKey) {
      toast.error('Please fix the highlighted fields')
      document.getElementById(`team-${firstKey}`)?.focus()
      return
    }

    // No tenantId: the backend files new members under the organisation of the current page.
    const input: Record<string, unknown> = {
      name: values.name.trim(),
      role: values.role.trim(),
      bio: values.bio.trim() || null,
      photo: values.photo || null,
      email: values.email || null,
      linkedinUrl: values.linkedinUrl || null,
      twitterUrl: values.twitterUrl || null,
      displayOrder: values.displayOrder,
      isActive: values.isActive,
    }

    if (mode === 'create') {
      createMember({ variables: { data: input } })
    } else if (memberId) {
      updateMember({ variables: { id: memberId, data: input } })
    }
  }

  const textField = (
    key: 'name' | 'role' | 'email' | 'linkedinUrl' | 'twitterUrl' | 'photo',
    label: string,
    opts: { required?: boolean; type?: string; placeholder?: string; description?: string } = {},
  ) => (
    <FormField
      id={`team-${key}`}
      label={label}
      required={opts.required}
      description={opts.description}
      error={fieldErrors[key]}
    >
      {(props) => (
        <Input
          {...props}
          type={opts.type}
          value={formData[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={opts.placeholder}
        />
      )}
    </FormField>
  )

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Basic information" description="Name, role and contact details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {textField('name', 'Name', { required: true, placeholder: 'Full name' })}
          {textField('role', 'Role / title', { required: true, placeholder: 'E.g., Executive Director' })}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {textField('email', 'Email', { type: 'email', placeholder: 'contact@example.com' })}
          <FormField
            id="team-displayOrder"
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {textField('linkedinUrl', 'LinkedIn link', { type: 'url', placeholder: 'https://linkedin.com/in/...' })}
          {textField('twitterUrl', 'Twitter / X link', { type: 'url', placeholder: 'https://twitter.com/...' })}
        </div>
      </FormSection>

      <FormSection title="Photo">
        {textField('photo', 'Photo link', {
          type: 'url',
          placeholder: 'https://example.com/photo.jpg',
          description: 'A full link starting with https://',
        })}
        {formData.photo && !fieldErrors.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={formData.photo}
            alt="Preview of the member photo"
            className="border-border h-32 w-32 rounded-lg border object-cover"
          />
        )}
      </FormSection>

      <FormSection title="Biography">
        <FormField id="team-bio" label="Biography">
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
            <Label htmlFor="team-isActive" className="text-sm font-medium">
              Active
            </Label>
            <p id="team-isActive-description" className="text-muted-foreground mt-0.5 text-xs">
              Visible in the public team listing
            </p>
          </div>
          <Switch
            id="team-isActive"
            aria-describedby="team-isActive-description"
            checked={formData.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
      </FormSection>

      <div className="border-border bg-background sticky bottom-0 z-10 border-t">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'create' ? 'Add member' : 'Save changes'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/team">Cancel</Link>
          </Button>
        </div>
      </div>
    </form>
  )
}
