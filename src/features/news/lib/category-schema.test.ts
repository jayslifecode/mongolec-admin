import { describe, expect, it } from 'vitest'
import { newsCategorySchema } from './category-schema'

const valid = { name_en: 'Wildlife', name_mn: 'Ан амьтан', slug: 'wildlife', color: '#3b82f6' }

describe('newsCategorySchema', () => {
  it('accepts a valid category', () => {
    expect(newsCategorySchema.safeParse(valid).success).toBe(true)
  })
  it('rejects a colour that is not hex', () => {
    const r = newsCategorySchema.safeParse({ ...valid, color: 'blue' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0].path[0]).toBe('color')
  })
  it('rejects a missing Mongolian name', () => {
    expect(newsCategorySchema.safeParse({ ...valid, name_mn: '' }).success).toBe(false)
  })
})
