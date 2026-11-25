import { describe, expect, it } from 'vitest'
import { validateExportRange } from './export-range'

describe('validateExportRange', () => {
  it('needs at least one date', () => {
    expect(validateExportRange('', '')).toEqual({ to: undefined, from: 'Pick a start date, an end date, or both' })
  })
  it('accepts a single bound', () => {
    expect(validateExportRange('2026-01-01', '')).toBeNull()
    expect(validateExportRange('', '2026-01-01')).toBeNull()
  })
  it('accepts equal dates', () => {
    expect(validateExportRange('2026-01-01', '2026-01-01')).toBeNull()
  })
  it('rejects an end before the start, on the end field', () => {
    expect(validateExportRange('2026-02-01', '2026-01-01')).toEqual({ to: 'The end date must be on or after the start date' })
  })
})
