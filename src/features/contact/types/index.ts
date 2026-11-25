export interface ContactMessage {
  id: string
  tenantId: string
  name: string
  email: string
  subject: string
  message: string
  status: ContactMessageStatus
  createdAt: string
  updatedAt: string
}

export type ContactMessageStatus = 'NEW' | 'READ' | 'REPLIED'

export const contactMessageStatusConfig: Record<
  ContactMessageStatus,
  { label: string; tone: 'neutral' | 'success' | 'warning' }
> = {
  NEW: { label: 'New', tone: 'warning' },
  READ: { label: 'Read', tone: 'neutral' },
  REPLIED: { label: 'Replied', tone: 'success' },
}
