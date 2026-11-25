import { describe, expect, it } from 'vitest'
import { mergeLocalized } from './localized'

describe('mergeLocalized', () => {
  it('combines English and Mongolian strings', () => {
    expect(mergeLocalized('Hat', 'Малгай')).toEqual({ en: 'Hat', mn: 'Малгай' })
  })
  it('falls back to the other language when one is missing', () => {
    expect(mergeLocalized('Hat', null)).toEqual({ en: 'Hat', mn: 'Hat' })
    expect(mergeLocalized(undefined, 'Малгай')).toEqual({ en: 'Малгай', mn: 'Малгай' })
  })
  it('returns empty strings when both are missing', () => {
    expect(mergeLocalized(null, undefined)).toEqual({ en: '', mn: '' })
  })
  it('passes an already-localized object through', () => {
    expect(mergeLocalized({ en: 'A', mn: 'B' }, 'ignored')).toEqual({ en: 'A', mn: 'B' })
  })
})
