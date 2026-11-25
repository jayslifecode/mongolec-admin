import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ListErrorProps {
  message: string
  onRetry: () => void
}

/** Shown instead of a table when the list failed to load (never an empty table). */
export function ListError({ message, onRetry }: ListErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center"
    >
      <AlertCircle className="text-muted-foreground h-6 w-6" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium">Could not load this list</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{message}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
