import { describe, expect, test } from 'vitest'
import { validateParticipantForm, type ParticipantFormValues } from './validation'

function values(overrides: Partial<ParticipantFormValues> = {}): ParticipantFormValues {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    photo: 'https://cdn.example.com/jane.jpg',
    country: 'USA',
    bio: '',
    displayOrder: 0,
    isActive: true,
    slug: '',
    honoraryTitle: '',
    rallyIds: [],
    ...overrides,
  }
}

describe('validateParticipantForm', () => {
  test('accepts a rider with a featured photo', () => {
    expect(validateParticipantForm(values())).toEqual({ isValid: true, fieldErrors: {} })
  })

  test('requires a featured photo (every rider is shown by one)', () => {
    for (const photo of ['', '   ']) {
      const result = validateParticipantForm(values({ photo }))
      expect(result.isValid).toBe(false)
      expect(result.fieldErrors.photo).toBe('A featured photo is required')
    }
  })
})

describe('validateParticipantForm links and slug', () => {
  test('rejects a photo link without a scheme or with javascript:', () => {
    for (const photo of ['cdn.example.com/a.jpg', 'javascript:alert(1)']) {
      expect(validateParticipantForm(values({ photo })).fieldErrors.photo).toBeDefined()
    }
  })

  test('accepts an empty slug and a valid slug', () => {
    expect(validateParticipantForm(values({ slug: '' })).isValid).toBe(true)
    expect(validateParticipantForm(values({ slug: 'jane-doe' })).isValid).toBe(true)
  })

  test('rejects a slug with capitals or spaces', () => {
    for (const slug of ['Jane Doe', 'JANE']) {
      expect(validateParticipantForm(values({ slug })).fieldErrors.slug).toBeDefined()
    }
  })

  test('rejects a non-integer display order', () => {
    expect(validateParticipantForm(values({ displayOrder: Number.NaN })).fieldErrors.displayOrder).toBeDefined()
    expect(validateParticipantForm(values({ displayOrder: -1 })).fieldErrors.displayOrder).toBeDefined()
  })
})
