import { z } from 'zod'

export interface ProductVariantInput {
  sku: string
  price: number
  inventory: number
}

export interface ProductFormInput {
  nameEn: string
  price: string
  compareAtPrice: string
  hasOptions: boolean
  trackInventory: boolean
  inventory: string
  minStock: string
  variants: ProductVariantInput[]
}

export interface ProductValidationResult {
  /** Keys: name, price, compareAtPrice, inventory, minStock, variants, variant.<index>.<sku|price|inventory> */
  fieldErrors: Record<string, string>
  data?: {
    price: number
    compareAtPrice: number | null
    inventory: number
    minStock: number | null
  }
}

const isBlank = (value: string) => value.trim() === ''
const toNumber = (value: string) => Number(value.trim())

function checkWholeNumber(value: string, label: string, add: (message: string) => void): number | null {
  if (isBlank(value)) {
    add(`Enter ${label}`)
    return null
  }
  const n = toNumber(value)
  if (!Number.isInteger(n) || n < 0) {
    add(`${label[0].toUpperCase()}${label.slice(1)} must be a whole number, 0 or more`)
    return null
  }
  return n
}

const variantSchema = z.object({
  sku: z.string().trim().min(1, 'Enter a SKU'),
  price: z.number({ message: 'Enter a price' }).min(0, 'The price cannot be negative'),
  inventory: z
    .number({ message: 'Enter the stock' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
})

function validateVariants(variants: ProductVariantInput[], errors: Record<string, string>) {
  const firstIndexBySku = new Map<string, number>()
  variants.forEach((variant, index) => {
    const parsed = variantSchema.safeParse(variant)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors[`variant.${index}.${String(issue.path[0])}`] ??= issue.message
      }
    }
    const key = variant.sku.trim().toLowerCase()
    if (!key) return
    if (firstIndexBySku.has(key)) {
      errors[`variant.${index}.sku`] ??= 'This SKU is already used by another variant'
    } else {
      firstIndexBySku.set(key, index)
    }
  })
}

/** Validates the product form's numbers and variants. The form keeps raw strings; this returns parsed numbers. */
export function validateProductForm(input: ProductFormInput): ProductValidationResult {
  const errors: Record<string, string> = {}

  if (!input.nameEn.trim()) errors.name = 'Enter the English product name'

  let price: number | null = null
  if (isBlank(input.price)) {
    errors.price = 'Enter a price'
  } else {
    const n = toNumber(input.price)
    if (!Number.isFinite(n)) errors.price = 'Enter a number'
    else if (n <= 0) errors.price = 'The price must be more than 0'
    else price = n
  }

  let compareAtPrice: number | null = null
  if (!isBlank(input.compareAtPrice)) {
    const n = toNumber(input.compareAtPrice)
    if (!Number.isFinite(n)) errors.compareAtPrice = 'Enter a number'
    else if (price !== null && n < price) errors.compareAtPrice = 'Compare-at price must be the same as or higher than the price'
    else compareAtPrice = n
  }

  let inventory = 0
  let minStock: number | null = null
  if (input.hasOptions) {
    if (input.variants.length === 0) errors.variants = 'Add at least one value to each option to create variants'
    validateVariants(input.variants, errors)
  } else if (input.trackInventory) {
    inventory = checkWholeNumber(input.inventory, 'the current stock', (m) => (errors.inventory = m)) ?? 0
    if (!isBlank(input.minStock)) {
      minStock = checkWholeNumber(input.minStock, 'the minimum stock', (m) => (errors.minStock = m))
    }
  }

  if (Object.keys(errors).length > 0 || price === null) return { fieldErrors: errors }
  return { fieldErrors: errors, data: { price, compareAtPrice, inventory, minStock } }
}
