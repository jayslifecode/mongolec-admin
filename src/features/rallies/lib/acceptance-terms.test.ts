import { describe, expect, test } from 'vitest'
import { EMPTY_TERMS_FORM, termsFromForm, termsToForm } from './acceptance-terms'

describe('acceptance-letter amounts on the rally form', () => {
  test('loads stored terms into text fields', () => {
    expect(
      termsToForm({ currency: 'USD', minimumContribution: 11000, deposit: 5750, nonRefundable: 4000, finalPaymentDue: '2027-06-01', startCity: 'Ulaanbaatar, Mongolia' }),
    ).toEqual({
      currency: 'USD',
      minimumContribution: '11000',
      deposit: '5750',
      nonRefundable: '4000',
      finalPaymentDue: '2027-06-01',
      startCity: 'Ulaanbaatar, Mongolia',
    })
    expect(termsToForm(null)).toEqual(EMPTY_TERMS_FORM)
  })

  test('saves numbers as numbers and drops empty fields', () => {
    expect(
      termsFromForm({ ...EMPTY_TERMS_FORM, minimumContribution: '11,000', deposit: ' 5750 ', finalPaymentDue: '2027-06-01' }),
    ).toEqual({ currency: 'USD', minimumContribution: 11000, deposit: 5750, finalPaymentDue: '2027-06-01' })
  })

  test('saves nothing when every amount is empty', () => {
    expect(termsFromForm(EMPTY_TERMS_FORM)).toBeNull()
  })

  test('ignores amounts that are not numbers', () => {
    expect(termsFromForm({ ...EMPTY_TERMS_FORM, deposit: 'abc' })).toBeNull()
  })
})
