import { describe, expect, it } from 'vitest'
import { normalizeDomain, validateTenantForm } from './tenant-schema'

const base = { name: 'Mongolec', slug: 'mongolec', domain: '' }

describe('normalizeDomain', () => {
  it('lowercases and strips scheme, path and trailing slash', () => {
    expect(normalizeDomain(' HTTPS://Example.com/ ')).toBe('example.com')
    expect(normalizeDomain('example.com/path')).toBe('example.com')
  })
})

describe('validateTenantForm', () => {
  it('accepts a valid tenant with no domain', () => {
    expect(validateTenantForm(base).fieldErrors).toEqual({})
  })
  it('requires a name', () => {
    expect(validateTenantForm({ ...base, name: ' ' }).fieldErrors.name).toBeTruthy()
  })
  it('rejects a bad slug', () => {
    expect(validateTenantForm({ ...base, slug: 'Not A Slug' }).fieldErrors.slug).toBeTruthy()
  })
  it('accepts a bare hostname', () => {
    expect(validateTenantForm({ ...base, domain: 'example.com' }).fieldErrors.domain).toBeUndefined()
    expect(validateTenantForm({ ...base, domain: 'shop.example.co.uk' }).fieldErrors.domain).toBeUndefined()
  })
  it('accepts a pasted URL by normalising it', () => {
    expect(validateTenantForm({ ...base, domain: 'https://example.com/' }).fieldErrors.domain).toBeUndefined()
  })
  it('rejects non-hostnames', () => {
    for (const domain of ['example', 'exa mple.com', '-bad.com', 'a..com', 'example.c']) {
      expect(validateTenantForm({ ...base, domain }).fieldErrors.domain).toBeTruthy()
    }
  })
})
