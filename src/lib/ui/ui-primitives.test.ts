import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { STATUS_TONES, toneClasses } from './status-tones'
import { initials } from './initials'
import { fieldControlProps } from './field-props'
import { dateOrder, money, optionalUrl, percent, phone, slug } from '../validation/rules'

describe('status tones (one primary + greys; colour only where it carries meaning)', () => {
  it('has exactly five tones, all built on theme tokens (light and dark)', () => {
    expect(STATUS_TONES).toEqual(['neutral', 'primary', 'success', 'warning', 'danger'])
    for (const tone of STATUS_TONES) expect(toneClasses(tone)).not.toMatch(/(red|green|yellow|blue|orange|purple)-\d/)
  })
})

describe('initials', () => {
  it('takes the first letters of the first and last word', () => {
    expect(initials('Anna Kim')).toBe('AK')
    expect(initials('Bataa Batsaikhan Erdene')).toBe('BE')
    expect(initials('madonna')).toBe('M')
  })
  it('handles empty names', () => {
    expect(initials('  ')).toBe('?')
  })
})

describe('fieldControlProps (labels, errors and hints reach screen readers)', () => {
  it('links the hint and marks required fields', () => {
    expect(fieldControlProps('title', { description: 'Shown on the site', required: true })).toEqual({
      id: 'title',
      'aria-describedby': 'title-description',
      'aria-required': true,
    })
  })
  it('marks an invalid field and links its error first', () => {
    expect(fieldControlProps('title', { description: 'x', error: 'Required' })).toEqual({
      id: 'title',
      'aria-invalid': true,
      'aria-describedby': 'title-error title-description',
    })
  })
})

describe('validation rules', () => {
  it('slug: lowercase words joined by dashes', () => {
    expect(slug.safeParse('mongolia-2027').success).toBe(true)
    expect(slug.safeParse('Mongolia 2027').success).toBe(false)
    expect(slug.safeParse('-bad-').success).toBe(false)
  })
  it('optionalUrl: empty or a full https/http URL', () => {
    expect(optionalUrl.safeParse('').success).toBe(true)
    expect(optionalUrl.safeParse('https://linkedin.com/in/x').success).toBe(true)
    expect(optionalUrl.safeParse('linkedin.com/in/x').success).toBe(false)
    expect(optionalUrl.safeParse('javascript:alert(1)').success).toBe(false)
  })
  it('money: zero or more with at most two decimals', () => {
    expect(money.safeParse(11000).success).toBe(true)
    expect(money.safeParse(-1).success).toBe(false)
    expect(money.safeParse(10.555).success).toBe(false)
  })
  it('percent: 0 to 100', () => {
    expect(percent.safeParse(100).success).toBe(true)
    expect(percent.safeParse(101).success).toBe(false)
  })
  it('phone: digits with common separators', () => {
    expect(phone.safeParse('+976 9911 2233').success).toBe(true)
    expect(phone.safeParse('call me').success).toBe(false)
  })
  it('dateOrder: an end before the start is an error on the end field', () => {
    const schema = z
      .object({ start: z.string(), end: z.string() })
      .superRefine(dateOrder('start', 'end', 'The end date must be on or after the start date.'))
    const result = schema.safeParse({ start: '2030-08-10', end: '2030-08-01' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['end'])
    expect(schema.safeParse({ start: '2030-08-01', end: '2030-08-10' }).success).toBe(true)
    expect(schema.safeParse({ start: '', end: '2030-08-10' }).success).toBe(true)
  })
})
