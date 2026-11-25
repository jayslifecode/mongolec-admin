import { describe, expect, test } from 'vitest'
import { validateParkPartnerForm, type ParkPartnerFormValues } from './validation'

function values(overrides: Partial<ParkPartnerFormValues> = {}): ParkPartnerFormValues {
  return {
    parkName: { en: 'Hustai', mn: '' },
    country: 'Mongolia',
    rangersCount: 0,
    contactEmail: '',
    contactPhone: '',
    ...overrides,
  }
}

describe('validateParkPartnerForm', () => {
  test('accepts the minimum: English park name and country', () => {
    expect(validateParkPartnerForm(values())).toEqual({})
  })

  test('requires the English park name even when Mongolian is filled', () => {
    const errors = validateParkPartnerForm(values({ parkName: { en: ' ', mn: 'Хустай' } }))
    expect(errors['parkName.en']).toBeDefined()
  })

  test('requires the country', () => {
    expect(validateParkPartnerForm(values({ country: ' ' })).country).toBeDefined()
  })

  test('phone is optional but checked when given', () => {
    expect(validateParkPartnerForm(values({ contactPhone: '' }))).toEqual({})
    expect(validateParkPartnerForm(values({ contactPhone: '+976 9911 2233' }))).toEqual({})
    expect(validateParkPartnerForm(values({ contactPhone: 'call me' })).contactPhone).toBeDefined()
  })

  test('email is optional but checked when given', () => {
    expect(validateParkPartnerForm(values({ contactEmail: 'x' })).contactEmail).toBeDefined()
    expect(validateParkPartnerForm(values({ contactEmail: 'a@b.org' }))).toEqual({})
  })

  test('rangers count must be a whole number of at least 0', () => {
    for (const n of [-1, 1.5, Number.NaN]) {
      expect(validateParkPartnerForm(values({ rangersCount: n })).rangersCount).toBeDefined()
    }
  })
})
