import { describe, expect, it } from 'vitest'
import { validateProductForm, type ProductFormInput } from './product-schema'

const base: ProductFormInput = {
  nameEn: 'Hoodie',
  price: '25000',
  compareAtPrice: '',
  hasOptions: false,
  trackInventory: true,
  inventory: '5',
  minStock: '',
  variants: [],
}

const variant = (sku: string, price = 100, inventory = 1) => ({ sku, price, inventory })

describe('validateProductForm', () => {
  it('accepts a valid simple product and returns numbers', () => {
    const r = validateProductForm(base)
    expect(r.fieldErrors).toEqual({})
    expect(r.data).toMatchObject({ price: 25000, compareAtPrice: null, inventory: 5, minStock: null })
  })

  it('requires the English name', () => {
    expect(validateProductForm({ ...base, nameEn: '  ' }).fieldErrors.name).toBeTruthy()
  })

  it('requires price above zero', () => {
    expect(validateProductForm({ ...base, price: '0' }).fieldErrors.price).toBeTruthy()
    expect(validateProductForm({ ...base, price: '' }).fieldErrors.price).toBeTruthy()
    expect(validateProductForm({ ...base, price: '-1' }).fieldErrors.price).toBeTruthy()
    expect(validateProductForm({ ...base, price: 'abc' }).fieldErrors.price).toBeTruthy()
  })

  it('allows empty compareAtPrice but not below price', () => {
    expect(validateProductForm({ ...base, compareAtPrice: '' }).fieldErrors.compareAtPrice).toBeUndefined()
    expect(validateProductForm({ ...base, compareAtPrice: '24999' }).fieldErrors.compareAtPrice).toBeTruthy()
    expect(validateProductForm({ ...base, compareAtPrice: '25000' }).fieldErrors.compareAtPrice).toBeUndefined()
  })

  it('requires whole non-negative stock when tracking inventory', () => {
    expect(validateProductForm({ ...base, inventory: '1.5' }).fieldErrors.inventory).toBeTruthy()
    expect(validateProductForm({ ...base, inventory: '-1' }).fieldErrors.inventory).toBeTruthy()
    expect(validateProductForm({ ...base, trackInventory: false, inventory: '-1' }).fieldErrors.inventory).toBeUndefined()
  })

  it('ignores simple-product stock when the product has options', () => {
    expect(validateProductForm({ ...base, hasOptions: true, inventory: '-4', variants: [variant('A')] }).fieldErrors.inventory).toBeUndefined()
  })

  it('requires a SKU on each variant', () => {
    const r = validateProductForm({ ...base, hasOptions: true, variants: [variant('A'), variant('  ')] })
    expect(r.fieldErrors['variant.1.sku']).toBeTruthy()
    expect(r.fieldErrors['variant.0.sku']).toBeUndefined()
  })

  it('flags duplicate SKUs (case-insensitive) on the later variant', () => {
    const r = validateProductForm({ ...base, hasOptions: true, variants: [variant('red-s'), variant('RED-S')] })
    expect(r.fieldErrors['variant.1.sku']).toMatch(/already used/i)
  })

  it('checks variant price and stock', () => {
    const r = validateProductForm({ ...base, hasOptions: true, variants: [variant('A', -1, 2), variant('B', 5, -2), variant('C', 5, 1.5)] })
    expect(r.fieldErrors['variant.0.price']).toBeTruthy()
    expect(r.fieldErrors['variant.1.inventory']).toBeTruthy()
    expect(r.fieldErrors['variant.2.inventory']).toBeTruthy()
  })

  it('allows a variant price of zero', () => {
    expect(validateProductForm({ ...base, hasOptions: true, variants: [variant('A', 0)] }).fieldErrors['variant.0.price']).toBeUndefined()
  })

  it('needs variants when options exist', () => {
    expect(validateProductForm({ ...base, hasOptions: true, variants: [] }).fieldErrors.variants).toBeTruthy()
  })
})
