import { describe, expect, it } from 'vitest'
import { generateSlug, validateRallyForm, type RallyFormValues } from './rally-schema'

const valid: RallyFormValues = {
  titleEn: 'Mongolia Rally 2027',
  slug: 'mongolia-rally-2027',
  startDate: '2027-07-01',
  endDate: '2027-07-20',
  applicationDeadline: '2027-05-01',
  duration: '20',
  maxParticipants: '40',
  photoCredit: 'Someone',
  heroVideo: '',
  isFeatured: false,
  currency: 'USD',
  minimumContribution: '11000',
  deposit: '5750',
  nonRefundable: '4000',
  finalPaymentDue: '2027-05-15',
}

const errorsFor = (patch: Partial<RallyFormValues>) => validateRallyForm({ ...valid, ...patch }).errors

describe('validateRallyForm', () => {
  it('accepts a complete form', () => {
    expect(validateRallyForm(valid).errors).toEqual({})
  })

  it('requires an English title', () => {
    expect(errorsFor({ titleEn: '  ' }).titleEn).toBeTruthy()
  })

  it('rejects a slug with capitals or spaces', () => {
    expect(errorsFor({ slug: 'My Rally' }).slug).toBeTruthy()
  })

  it('requires start and end dates', () => {
    const errors = errorsFor({ startDate: '', endDate: '' })
    expect(errors.startDate).toBeTruthy()
    expect(errors.endDate).toBeTruthy()
  })

  it('rejects an end date before the start date, on the end field', () => {
    expect(errorsFor({ endDate: '2027-06-01' }).endDate).toMatch(/end date/i)
  })

  it('rejects a deadline after the start date', () => {
    expect(errorsFor({ applicationDeadline: '2027-07-05' }).applicationDeadline).toBeTruthy()
  })

  it('allows an empty deadline', () => {
    expect(errorsFor({ applicationDeadline: '' }).applicationDeadline).toBeUndefined()
  })

  it('rejects negative or fractional duration', () => {
    expect(errorsFor({ duration: '-1' }).duration).toBeTruthy()
    expect(errorsFor({ duration: '1.5' }).duration).toBeTruthy()
  })

  it('allows empty max participants but not 0', () => {
    expect(errorsFor({ maxParticipants: '' }).maxParticipants).toBeUndefined()
    expect(errorsFor({ maxParticipants: '0' }).maxParticipants).toBeTruthy()
  })

  it('limits photo credit to 200 characters', () => {
    expect(errorsFor({ photoCredit: 'a'.repeat(201) }).photoCredit).toBeTruthy()
    expect(errorsFor({ photoCredit: 'a'.repeat(200) }).photoCredit).toBeUndefined()
  })

  it('rejects a video link without a scheme', () => {
    expect(errorsFor({ heroVideo: 'youtube.com/x' }).heroVideo).toBeTruthy()
  })

  it('rejects non-numeric and negative amounts', () => {
    expect(errorsFor({ minimumContribution: 'abc' }).minimumContribution).toBeTruthy()
    expect(errorsFor({ minimumContribution: '-5' }).minimumContribution).toBeTruthy()
  })

  it('accepts amounts with thousands separators', () => {
    expect(errorsFor({ minimumContribution: '11,000' }).minimumContribution).toBeUndefined()
  })

  it('requires deposit not above the minimum contribution', () => {
    expect(errorsFor({ deposit: '12000' }).deposit).toBeTruthy()
  })

  it('requires non-refundable not above the deposit', () => {
    expect(errorsFor({ nonRefundable: '6000' }).nonRefundable).toBeTruthy()
  })

  it('rejects an invalid final payment date', () => {
    expect(errorsFor({ finalPaymentDue: '2027-13-45' }).finalPaymentDue).toBeTruthy()
  })

  it('requires a 3-letter currency', () => {
    expect(errorsFor({ currency: 'US' }).currency).toBeTruthy()
    expect(errorsFor({ currency: 'EUR' }).currency).toBeUndefined()
  })
})

describe('generateSlug', () => {
  it('lowercases and dashes', () => {
    expect(generateSlug('Mongolia Rally 2027!')).toBe('mongolia-rally-2027')
  })
})
