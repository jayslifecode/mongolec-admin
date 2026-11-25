export type SubscriptionStatus = 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED' | 'PENDING'

export interface Subscriber {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  status: SubscriptionStatus
  source: string | null
  createdAt: string
}

export const SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = ['ACTIVE', 'PENDING', 'UNSUBSCRIBED', 'BOUNCED']

export const SUBSCRIBER_STATUS_BADGE: Record<
  SubscriptionStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' }
> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  PENDING: { label: 'Pending', tone: 'warning' },
  UNSUBSCRIBED: { label: 'Unsubscribed', tone: 'neutral' },
  BOUNCED: { label: 'Bounced', tone: 'danger' },
}

export function countByStatus(subscribers: Subscriber[]): Record<SubscriptionStatus, number> {
  const counts: Record<SubscriptionStatus, number> = { ACTIVE: 0, UNSUBSCRIBED: 0, BOUNCED: 0, PENDING: 0 }
  for (const s of subscribers) if (s.status in counts) counts[s.status] += 1
  return counts
}

export function filterSubscribers(
  subscribers: Subscriber[],
  query: string,
  status: SubscriptionStatus | 'all',
): Subscriber[] {
  const q = query.trim().toLowerCase()
  return subscribers.filter((s) => {
    if (status !== 'all' && s.status !== status) return false
    if (!q) return true
    const haystack = [s.email, s.firstName, s.lastName].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(q)
  })
}
