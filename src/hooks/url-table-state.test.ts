import { describe, expect, it } from 'vitest'
import { buildTableUrl } from './use-url-table-state'

describe('buildTableUrl', () => {
  it('sets page and keeps other params', () => {
    expect(buildTableUrl('/users', new URLSearchParams('search=ann'), { page: 3 })).toBe('/users?search=ann&page=3')
  })
  it('resets to page 1 when the search changes', () => {
    expect(buildTableUrl('/users', new URLSearchParams('page=4'), { search: 'bo' }, { resetPage: true })).toBe('/users?search=bo')
  })
  it('drops empty values', () => {
    expect(buildTableUrl('/users', new URLSearchParams('search=ann&page=2'), { search: '' }, { resetPage: true })).toBe('/users')
  })
  it('omits page 1', () => {
    expect(buildTableUrl('/users', new URLSearchParams('page=2'), { page: 1 })).toBe('/users')
  })
})
