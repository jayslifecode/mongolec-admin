import { describe, expect, it } from 'vitest'
import { validateDiscountForm } from './discount-schema'

const base = { name: 'Summer', type: 'PERCENT' as const, value: '20', startDate: '2026-06-01', endDate: '2026-06-30' }

describe('validateDiscountForm', () => {
  it('accepts a valid percent discount and returns a number', () => {
    const r = validateDiscountForm(base)
    expect(r.fieldErrors).toEqual({})
    expect(r.data?.value).toBe(20)
  })
  it('requires a name', () => {
    expect(validateDiscountForm({ ...base, name: ' ' }).fieldErrors.name).toBeTruthy()
  })
  it('requires a numeric value', () => {
    expect(validateDiscountForm({ ...base, value: '' }).fieldErrors.value).toBeTruthy()
    expect(validateDiscountForm({ ...base, value: 'abc' }).fieldErrors.value).toBeTruthy()
  })
  it('rejects percent above 100 and at or below 0', () => {
    expect(validateDiscountForm({ ...base, value: '101' }).fieldErrors.value).toBeTruthy()
    expect(validateDiscountForm({ ...base, value: '0' }).fieldErrors.value).toBeTruthy()
    expect(validateDiscountForm({ ...base, value: '100' }).fieldErrors.value).toBeUndefined()
  })
  it('allows large fixed amounts but not zero or negative', () => {
    const amount = { ...base, type: 'AMOUNT' as const }
    expect(validateDiscountForm({ ...amount, value: '5000' }).fieldErrors.value).toBeUndefined()
    expect(validateDiscountForm({ ...amount, value: '0' }).fieldErrors.value).toBeTruthy()
    expect(validateDiscountForm({ ...amount, value: '-3' }).fieldErrors.value).toBeTruthy()
  })
  it('requires both dates and end on or after start', () => {
    expect(validateDiscountForm({ ...base, startDate: '' }).fieldErrors.startDate).toBeTruthy()
    expect(validateDiscountForm({ ...base, endDate: '' }).fieldErrors.endDate).toBeTruthy()
    expect(validateDiscountForm({ ...base, endDate: '2026-05-01' }).fieldErrors.endDate).toBeTruthy()
    expect(validateDiscountForm({ ...base, endDate: '2026-06-01' }).fieldErrors.endDate).toBeUndefined()
  })
})
