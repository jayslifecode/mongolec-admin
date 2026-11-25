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
