import { describe, expect, test } from 'vitest'
import { computeRiderStats } from './rider-stats'

describe('computeRiderStats', () => {
  test('uses the server total, not the number of loaded rows', () => {
    const stats = computeRiderStats([{ isActive: true }, { isActive: false }], 127)
    expect(stats.total).toBe(127)
  })

  test('counts active and inactive from loaded rows', () => {
    const stats = computeRiderStats([{ isActive: true }, { isActive: true }, { isActive: false }], 3)
    expect(stats).toEqual({ total: 3, active: 2, inactive: 1, isPartial: false })
  })

  test('flags a partial load when fewer rows arrive than the total', () => {
    expect(computeRiderStats([{ isActive: true }], 5).isPartial).toBe(true)
  })

  test('falls back to loaded rows when the total is missing', () => {
    expect(computeRiderStats([{ isActive: true }], undefined).total).toBe(1)
  })
})
