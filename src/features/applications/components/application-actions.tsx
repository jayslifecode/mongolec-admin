'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useMutation } from '@apollo/client/react'
import {
  APPROVE_APPLICATION,
  REJECT_APPLICATION,
  WAITLIST_APPLICATION,
  CONFIRM_APPLICATION,
  CHANGE_APPLICATION_PAYMENT_STATUS,
} from '@/graphql/mutations/applications'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

// The backend requires a rejection reason, so an empty one is sent as this default.
const DEFAULT_REJECTION_REASON = 'No reason given'

type PaymentOption = 'PENDING' | 'DEPOSIT_PAID' | 'FULLY_PAID'

function paymentToArgs(option: PaymentOption) {
  if (option === 'FULLY_PAID') return { depositPaid: true, fullyPaid: true }
  if (option === 'DEPOSIT_PAID') return { depositPaid: true, fullyPaid: false }
  return { depositPaid: false, fullyPaid: false }
}

function argsToPayment(depositPaid?: boolean, fullyPaid?: boolean): PaymentOption {
  if (fullyPaid) return 'FULLY_PAID'
  if (depositPaid) return 'DEPOSIT_PAID'
  return 'PENDING'
}

// ─── Approve ───────────────────────────────────────────────────────────────

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  onActionComplete?: () => void
}

export function ApproveDialog({ open, onOpenChange, applicationId, onActionComplete }: ApproveDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [approveApplication, { loading }] = useMutation(APPROVE_APPLICATION, {
    refetchQueries: ['GetApplications', 'GetApplication', 'GetApplicationStats'],
  })

  const handleApprove = async () => {
    try {
      await approveApplication({ variables: { id: applicationId, notes: notes || undefined } })
      toast.success('Application approved')
      router.refresh()
      onOpenChange(false)
      setNotes('')
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to approve application'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Application</DialogTitle>
          <DialogDescription>Optionally add notes for this approval.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="approve-notes">Notes (optional)</Label>
          <Textarea
            id="approve-notes"
            placeholder="Add notes about this approval..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={handleApprove} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Reject ────────────────────────────────────────────────────────────────

interface RejectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  onActionComplete?: () => void
}

export function RejectDialog({ open, onOpenChange, applicationId, onActionComplete }: RejectDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [rejectApplication, { loading }] = useMutation(REJECT_APPLICATION, {
    refetchQueries: ['GetApplications', 'GetApplication', 'GetApplicationStats'],
  })

  const handleReject = async () => {
    try {
      await rejectApplication({ variables: { id: applicationId, reason: reason.trim() || DEFAULT_REJECTION_REASON } })
      toast.success('Application rejected')
      router.refresh()
      onOpenChange(false)
      setReason('')
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to reject application'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Application</DialogTitle>
          <DialogDescription>
            This marks the application as rejected. A reason is optional but helps your team later.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="reject-reason">Reason (optional)</Label>
          <Textarea
            id="reject-reason"
            placeholder="Explain why this application is being rejected..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleReject} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Reject application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Waitlist ──────────────────────────────────────────────────────────────

interface WaitlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  onActionComplete?: () => void
}

export function WaitlistDialog({ open, onOpenChange, applicationId, onActionComplete }: WaitlistDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [waitlistApplication, { loading }] = useMutation(WAITLIST_APPLICATION, {
    refetchQueries: ['GetApplications', 'GetApplication', 'GetApplicationStats'],
  })

  const handleWaitlist = async () => {
    try {
      await waitlistApplication({ variables: { id: applicationId, notes: notes || undefined } })
      toast.success('Application added to waitlist')
      router.refresh()
      onOpenChange(false)
      setNotes('')
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to waitlist application'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Waitlist</DialogTitle>
          <DialogDescription>Optionally add notes for this waitlist decision.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="waitlist-notes">Notes (optional)</Label>
          <Textarea
            id="waitlist-notes"
            placeholder="Add notes about this waitlist decision..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={handleWaitlist} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Add to Waitlist
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Confirm ───────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  onActionComplete?: () => void
}

export function ConfirmDialog({ open, onOpenChange, applicationId, onActionComplete }: ConfirmDialogProps) {
  const router = useRouter()
  const [confirmApplication, { loading }] = useMutation(CONFIRM_APPLICATION, {
    refetchQueries: ['GetApplications', 'GetApplication', 'GetApplicationStats'],
  })

  const handleConfirm = async () => {
    try {
      await confirmApplication({ variables: { id: applicationId } })
      toast.success('Application confirmed')
      router.refresh()
      onOpenChange(false)
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to confirm application'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Application</DialogTitle>
          <DialogDescription>Confirm this applicant&apos;s participation in the rally.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Update Payment ────────────────────────────────────────────────────────

interface UpdatePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: string
  depositPaid?: boolean
  fullyPaid?: boolean
  onActionComplete?: () => void
}

export function UpdatePaymentDialog({
  open,
  onOpenChange,
  applicationId,
  depositPaid,
  fullyPaid,
  onActionComplete,
}: UpdatePaymentDialogProps) {
  const router = useRouter()
  const currentOption = argsToPayment(depositPaid, fullyPaid)
  const [selected, setSelected] = useState<PaymentOption>(currentOption)
  const [changePayment, { loading }] = useMutation(CHANGE_APPLICATION_PAYMENT_STATUS, {
    refetchQueries: ['GetApplications', 'GetApplication'],
  })

  const handleUpdate = async () => {
    try {
      await changePayment({ variables: { id: applicationId, ...paymentToArgs(selected) } })
      toast.success('Payment status updated')
      router.refresh()
      onOpenChange(false)
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to update payment status'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
          <DialogDescription>Set the current payment status for this application.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="payment-status">Payment Status</Label>
          <Select value={selected} onValueChange={(v) => setSelected(v as PaymentOption)}>
            <SelectTrigger id="payment-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="DEPOSIT_PAID">Deposit Paid</SelectItem>
              <SelectItem value="FULLY_PAID">Fully Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" onClick={handleUpdate} disabled={loading || selected === currentOption}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Legacy compat exports (for detail page usage) ─────────────────────────

interface LegacyProps {
  applicationId: string
  status: string
  onActionComplete?: () => void
}

export function ApproveButton({ applicationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>Approve</Button>
      <ApproveDialog open={open} onOpenChange={setOpen} applicationId={applicationId} onActionComplete={onActionComplete} />
    </>
  )
}

export function RejectButton({ applicationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" variant="destructive" onClick={() => setOpen(true)}>Reject</Button>
      <RejectDialog open={open} onOpenChange={setOpen} applicationId={applicationId} onActionComplete={onActionComplete} />
    </>
  )
}

export function WaitlistButton({ applicationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Waitlist</Button>
      <WaitlistDialog open={open} onOpenChange={setOpen} applicationId={applicationId} onActionComplete={onActionComplete} />
    </>
  )
}

export function ConfirmButton({ applicationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>Confirm</Button>
      <ConfirmDialog open={open} onOpenChange={setOpen} applicationId={applicationId} onActionComplete={onActionComplete} />
    </>
  )
}

export function UpdatePaymentStatusButton({
  applicationId,
  onActionComplete,
}: LegacyProps & { currentStatus?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Update Payment</Button>
      <UpdatePaymentDialog open={open} onOpenChange={setOpen} applicationId={applicationId} onActionComplete={onActionComplete} />
    </>
  )
}
