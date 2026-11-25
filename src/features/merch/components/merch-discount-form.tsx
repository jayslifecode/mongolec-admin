'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { FormField, FormSection } from '@/components/admin'
import { AutocompleteSelectFilter } from '@/components/data-table/autocomplete-select-filter'
import {
  CREATE_MERCH_DISCOUNT,
  UPDATE_MERCH_DISCOUNT,
} from '@/graphql/mutations/merch'
import { GET_MERCH_DISCOUNTS, GET_MERCH_PRODUCTS } from '@/graphql/queries/merch'
import type { MerchDiscountType } from '../types'
import { validateDiscountForm } from '../lib/discount-schema'

const FIELD_ORDER = ['name', 'type', 'value', 'startDate', 'endDate'] as const
const FIELD_DOM_IDS: Record<(typeof FIELD_ORDER)[number], string> = {
  name: 'discount-name',
  type: 'discount-type',
  value: 'discount-value',
  startDate: 'start-date',
  endDate: 'end-date',
}

interface MerchDiscountFormProps {
  mode?: 'create' | 'edit'
  discountId?: string
  initialData?: {
    id: string
    name?: string
    type?: MerchDiscountType
    value?: number
    startDate?: string
    endDate?: string
    isActive?: boolean
    productIds?: string[]
  }
}

function toDateInputValue(iso: string | undefined): string {
  if (!iso) return ''
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

export function MerchDiscountForm({
  mode = 'create',
  discountId,
  initialData,
}: MerchDiscountFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initialData?.name ?? '')
  const [type, setType] = useState<MerchDiscountType>(initialData?.type ?? 'PERCENT')
  const [value, setValue] = useState(String(initialData?.value ?? ''))
  const [startDate, setStartDate] = useState(toDateInputValue(initialData?.startDate))
  const [endDate, setEndDate] = useState(toDateInputValue(initialData?.endDate))
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [productIds, setProductIds] = useState<string[]>(initialData?.productIds ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const refetchQueries = [{ query: GET_MERCH_DISCOUNTS }]

  const [createDiscount, { loading: creating }] = useMutation(CREATE_MERCH_DISCOUNT, { refetchQueries })
  const [updateDiscount, { loading: updating }] = useMutation(UPDATE_MERCH_DISCOUNT, { refetchQueries })
  const loading = creating || updating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { fieldErrors, data } = validateDiscountForm({ name, type, value, startDate, endDate })
    setErrors(fieldErrors)
    const firstInvalid = FIELD_ORDER.find((key) => fieldErrors[key])
    if (firstInvalid || !data) {
      if (firstInvalid) document.getElementById(FIELD_DOM_IDS[firstInvalid])?.focus()
      return
    }

    const input = {
      name: data.name,
      type: data.type,
      value: data.value,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      isActive,
      productIds,
    }

    try {
      if (mode === 'edit' && discountId) {
        await updateDiscount({ variables: { id: discountId, input } })
        toast.success('Discount updated successfully')
      } else {
        await createDiscount({ variables: { input } })
        toast.success('Discount created successfully')
      }
      router.push('/merch/discounts')
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : 'Failed to save discount')
    }
  }

  // Product names are localized JSON ({en,mn}); map to plain-string labels so
  // the picker shows readable names instead of "[object Object]".
  const localizedName = (field: unknown): string => {
    if (typeof field === 'string') return field
    const f = field as { en?: string; mn?: string } | null
    return f?.en || f?.mn || ''
  }
  const { data: productsData } = useQuery<{
    getMerchProducts: { id: string; name: unknown }[]
  }>(GET_MERCH_PRODUCTS, {
    variables: { language: 'en', limit: 500, offset: 0 },
  })
  const productOptions = (productsData?.getMerchProducts ?? []).map((p) => ({
    value: p.id,
    label: localizedName(p.name),
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormSection
        title="Discount Information"
        description="Name, type, and value for this discount"
      >
        <FormField id="discount-name" label="Name" required error={errors.name}>
          {(control) => (
            <Input
              {...control}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Sale 20%"
            />
          )}
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="discount-type">
              Type <span className="text-destructive" aria-hidden="true">*</span>
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as MerchDiscountType)}>
              <SelectTrigger id="discount-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENT">Percent (%)</SelectItem>
                <SelectItem value="AMOUNT">Fixed amount (₮)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <FormField
            id="discount-value"
            label={`Value ${type === 'PERCENT' ? '(%)' : '(amount)'}`}
            required
            error={errors.value}
            description={type === 'PERCENT' ? 'Between 0 and 100.' : 'More than 0.'}
          >
            {(control) => (
              <Input
                {...control}
                type="number"
                inputMode="decimal"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'PERCENT' ? '20' : '10000'}
              />
            )}
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Schedule"
        description="Set when this discount is valid"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField id="start-date" label="Start date" required error={errors.startDate}>
            {(control) => (
              <Input {...control} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            )}
          </FormField>
          <FormField id="end-date" label="End date" required error={errors.endDate}>
            {(control) => (
              <Input {...control} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            )}
          </FormField>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
          <div>
            <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enable this discount immediately
            </p>
          </div>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </FormSection>

      <FormSection
        title="Products"
        description="Attach this discount to specific products (optional)"
      >
        <div className="space-y-1.5">
          <Label id="discount-products-label">Products</Label>
          <AutocompleteSelectFilter
            value={productIds}
            onChange={(v) => setProductIds(Array.isArray(v) ? v : v ? [v] : [])}
            options={productOptions}
            isMulti
            placeholder="Search and select products…"
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 z-10 border-t bg-background">
        <div className="flex items-center gap-3 py-4">
          <Button type="submit" disabled={loading} className="min-w-[160px]">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {mode === 'edit' ? 'Update Discount' : 'Create Discount'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
