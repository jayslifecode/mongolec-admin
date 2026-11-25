import { describe, expect, test } from 'vitest'
import { countByStatus, filterSubscribers, type Subscriber } from './subscribers'

const sub = (over: Partial<Subscriber>): Subscriber => ({
  id: '1',
  email: 'a@b.org',
  firstName: null,
  lastName: null,
  status: 'ACTIVE',
  source: null,
  createdAt: '2026-01-01',
  ...over,
})

describe('filterSubscribers', () => {
  const list = [
    sub({ id: '1', email: 'anna@x.org', firstName: 'Anna', lastName: 'Kim' }),
    sub({ id: '2', email: 'bold@y.org', status: 'UNSUBSCRIBED' }),
  ]

  test('returns everything for an empty query and status "all"', () => {
    expect(filterSubscribers(list, '  ', 'all')).toHaveLength(2)
  })

  test('matches email and name, ignoring case', () => {
    expect(filterSubscribers(list, 'KIM', 'all').map((s) => s.id)).toEqual(['1'])
    expect(filterSubscribers(list, 'bold@', 'all').map((s) => s.id)).toEqual(['2'])
  })

  test('filters by status', () => {
    expect(filterSubscribers(list, '', 'UNSUBSCRIBED').map((s) => s.id)).toEqual(['2'])
  })
})

describe('countByStatus', () => {
  test('counts each status', () => {
    const counts = countByStatus([sub({}), sub({}), sub({ status: 'BOUNCED' })])
    expect(counts).toEqual({ ACTIVE: 2, UNSUBSCRIBED: 0, BOUNCED: 1, PENDING: 0 })
  })
})
