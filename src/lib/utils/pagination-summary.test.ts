import { describe, expect, it } from 'vitest'
import { paginationSummary } from './pagination-summary'

describe('paginationSummary', () => {
  it('describes the rows on the current page', () => {
    expect(paginationSummary(127, 1, 10)).toBe('Showing 1–10 of 127')
    expect(paginationSummary(127, 13, 10)).toBe('Showing 121–127 of 127')
  })

  it('says there is nothing to show instead of "1–0 of 0"', () => {
    expect(paginationSummary(0, 1, 10)).toBe('No results')
  })

  it('uses the singular for one row', () => {
    expect(paginationSummary(1, 1, 10)).toBe('Showing 1 of 1')
  })
})
