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
  APPROVE_NOMINATION,
  REJECT_NOMINATION,
} from '@/graphql/mutations/nominations'
import { toast } from 'sonner'

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

// ─── Approve ───────────────────────────────────────────────────────────────

interface ApproveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nominationId: string
  onActionComplete?: () => void
}

export function ApproveDialog({ open, onOpenChange, nominationId, onActionComplete }: ApproveDialogProps) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [approveNomination, { loading }] = useMutation(APPROVE_NOMINATION, {
    refetchQueries: ['GetNominations', 'GetNomination', 'GetNominationStats'],
  })

  const handleApprove = async () => {
    try {
      await approveNomination({ variables: { id: nominationId, notes: notes || undefined } })
      toast.success('Nomination approved')
      router.refresh()
      onOpenChange(false)
      setNotes('')
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to approve nomination'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Nomination</DialogTitle>
          <DialogDescription>
            Approve this nomination? You can add notes for your team.
          </DialogDescription>
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
  nominationId: string
  onActionComplete?: () => void
}

export function RejectDialog({ open, onOpenChange, nominationId, onActionComplete }: RejectDialogProps) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string | null>(null)
  const [rejectNomination, { loading }] = useMutation(REJECT_NOMINATION, {
    refetchQueries: ['GetNominations', 'GetNomination', 'GetNominationStats'],
  })

  const handleReject = async () => {
    if (!reason.trim()) { setReasonError('Enter a reason for the rejection'); return }
    try {
      await rejectNomination({ variables: { id: nominationId, reason: reason.trim() } })
      toast.success('Nomination rejected')
      router.refresh()
      onOpenChange(false)
      setReason('')
      setReasonError(null)
      onActionComplete?.()
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to reject nomination'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Nomination</DialogTitle>
          <DialogDescription>
            This marks the nomination as rejected. Please give a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="reject-reason">Reason *</Label>
          <Textarea
            id="reject-reason"
            placeholder="Explain why this nomination is being rejected..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setReasonError(null)
            }}
            rows={3}
            aria-required="true"
            aria-invalid={reasonError ? true : undefined}
            aria-describedby={reasonError ? 'reject-reason-error' : undefined}
          />
          {reasonError && (
            <p id="reject-reason-error" role="alert" className="text-sm text-destructive">
              {reasonError}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={handleReject} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Reject nomination
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Legacy compat exports (for detail page usage) ─────────────────────────

interface LegacyProps {
  nominationId: string
  status: string
  onActionComplete?: () => void
}

export function ApproveButton({ nominationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>Approve</Button>
      <ApproveDialog open={open} onOpenChange={setOpen} nominationId={nominationId} onActionComplete={onActionComplete} />
    </>
  )
}

export function RejectButton({ nominationId, onActionComplete }: LegacyProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" size="sm" variant="destructive" onClick={() => setOpen(true)}>Reject</Button>
      <RejectDialog open={open} onOpenChange={setOpen} nominationId={nominationId} onActionComplete={onActionComplete} />
    </>
  )
}
