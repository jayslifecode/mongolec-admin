import { describe, expect, test } from 'vitest'
import { validateRangerForm, type RangerFormValues } from './validation'

function values(overrides: Partial<RangerFormValues> = {}): RangerFormValues {
  return {
    name: 'Bat',
    parkName: 'Hustai National Park',
    country: 'Mongolia',
    photo: '',
    bio: '',
    displayOrder: 0,
    isActive: true,
    rallyId: '',
    ...overrides,
  }
}

describe('validateRangerForm', () => {
  test('accepts a minimal ranger', () => {
    expect(validateRangerForm(values())).toEqual({})
  })

  test('requires name, park name and country', () => {
    const errors = validateRangerForm(values({ name: ' ', parkName: '', country: '' }))
    expect(Object.keys(errors).sort()).toEqual(['country', 'name', 'parkName'])
  })

  test('accepts an https photo and rejects other values', () => {
    expect(validateRangerForm(values({ photo: 'https://cdn.example.com/a.jpg' }))).toEqual({})
    expect(validateRangerForm(values({ photo: 'example.com/a.jpg' })).photo).toBeDefined()
    expect(validateRangerForm(values({ photo: 'javascript:alert(1)' })).photo).toBeDefined()
  })

  test('rejects a negative or non-whole display order', () => {
    expect(validateRangerForm(values({ displayOrder: -1 })).displayOrder).toBeDefined()
    expect(validateRangerForm(values({ displayOrder: Number.NaN })).displayOrder).toBeDefined()
    expect(validateRangerForm(values({ displayOrder: 1.5 })).displayOrder).toBeDefined()
  })

  test('rejects a rally id that is not in the known rallies', () => {
    expect(validateRangerForm(values({ rallyId: 'r2' }), ['r1']).rallyId).toBeDefined()
    expect(validateRangerForm(values({ rallyId: 'r1' }), ['r1'])).toEqual({})
  })

  test('skips the rally check when the rally list is not loaded', () => {
    expect(validateRangerForm(values({ rallyId: 'r2' }))).toEqual({})
  })
})
