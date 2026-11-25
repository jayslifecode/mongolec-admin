import { describe, expect, it } from 'vitest'
import { categoryBaseSchema, firstErrorLanguage, hexColor } from './category-schema'

const valid = { name_en: 'Apparel', name_mn: 'Хувцас', slug: 'apparel' }

describe('categoryBaseSchema', () => {
  it('accepts a valid category', () => {
    expect(categoryBaseSchema.safeParse(valid).success).toBe(true)
  })
  it('requires both names', () => {
    const r = categoryBaseSchema.safeParse({ ...valid, name_mn: ' ' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path[0]).toBe('name_mn')
  })
  it('applies the shared slug rule', () => {
    expect(categoryBaseSchema.safeParse({ ...valid, slug: 'Bad Slug' }).success).toBe(false)
  })
})

describe('hexColor', () => {
  it('accepts 3 and 6 digit hex', () => {
    expect(hexColor.safeParse('#fff').success).toBe(true)
    expect(hexColor.safeParse('#3B82F6').success).toBe(true)
  })
  it('rejects names and malformed values', () => {
    for (const v of ['red', '3b82f6', '#12', '#12345g', '']) expect(hexColor.safeParse(v).success).toBe(false)
  })
})

describe('firstErrorLanguage', () => {
  it('finds the tab with the error', () => {
    expect(firstErrorLanguage(['slug', 'name_mn'])).toBe('mn')
    expect(firstErrorLanguage(['name_en'])).toBe('en')
    expect(firstErrorLanguage(['slug'])).toBeNull()
  })
})
