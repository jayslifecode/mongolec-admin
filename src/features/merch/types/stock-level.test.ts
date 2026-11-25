import { describe, expect, it } from 'vitest'
import { getStockLevel, merchStatusConfig, stockLevelConfig } from './index'
import { orderStatusConfig } from './orders'

describe('getStockLevel', () => {
  it('is out at zero or below', () => {
    expect(getStockLevel(0)).toBe('out')
    expect(getStockLevel(-2)).toBe('out')
  })
  it('is low at or under the minimum (default 10)', () => {
    expect(getStockLevel(10)).toBe('low')
    expect(getStockLevel(11)).toBe('in')
    expect(getStockLevel(4, 5)).toBe('low')
    expect(getStockLevel(6, 5)).toBe('in')
  })
})

describe('status tones', () => {
  it('maps stock levels to success / warning / danger', () => {
    expect(stockLevelConfig.in.tone).toBe('success')
    expect(stockLevelConfig.low.tone).toBe('warning')
    expect(stockLevelConfig.out.tone).toBe('danger')
  })
  it('maps order statuses to the agreed tones', () => {
    expect(orderStatusConfig.PAID.tone).toBe('success')
    expect(orderStatusConfig.DELIVERED.tone).toBe('success')
    expect(orderStatusConfig.AWAITING_PAYMENT.tone).toBe('warning')
    expect(orderStatusConfig.PENDING.tone).toBe('warning')
    expect(orderStatusConfig.CANCELLED.tone).toBe('danger')
    expect(orderStatusConfig.EXPIRED.tone).toBe('neutral')
  })
  it('marks out-of-stock products as danger', () => {
    expect(merchStatusConfig.OUT_OF_STOCK.tone).toBe('danger')
  })
})
