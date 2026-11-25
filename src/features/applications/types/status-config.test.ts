import { describe, expect, test } from 'vitest'
import { applicationStatusConfig, paymentStatusConfig } from './index'
import { nominationStatusConfig } from '@/features/nominations/types'
import { rallyStatusConfig } from '@/features/rallies/types'
import { storyStatusConfig } from '@/features/stories/types'

describe('status tones', () => {
  test('application statuses map to the agreed tones', () => {
    expect(applicationStatusConfig.PENDING.tone).toBe('warning')
    expect(applicationStatusConfig.APPROVED.tone).toBe('success')
    expect(applicationStatusConfig.REJECTED.tone).toBe('danger')
    expect(applicationStatusConfig.CONFIRMED.tone).toBe('primary')
    expect(applicationStatusConfig.WAITLIST.tone).toBe('warning')
  })

  test('payment statuses map to the agreed tones', () => {
    expect(paymentStatusConfig.DEPOSIT_PAID.tone).toBe('warning')
    expect(paymentStatusConfig.FULLY_PAID.tone).toBe('success')
    expect(paymentStatusConfig.REFUNDED.tone).toBe('neutral')
  })

  test('rally, nomination and story statuses use tones only', () => {
    expect(rallyStatusConfig.COMPLETED.tone).toBe('success')
    expect(rallyStatusConfig.CANCELLED.tone).toBe('danger')
    expect(nominationStatusConfig.REJECTED.tone).toBe('danger')
    expect(storyStatusConfig.PUBLISHED.tone).toBe('success')
  })
})
