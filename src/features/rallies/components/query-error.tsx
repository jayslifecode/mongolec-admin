import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryErrorProps {
  title: string
  message: string
  onRetry?: () => void
}

/** Shown in place of a list when its query failed, so an error never looks like "no data". */
export function QueryError({ title, message, onRetry }: QueryErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
