import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QueryErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

/** Shown in place of a list or table whose data failed to load, so it never looks like "no data". */
export function QueryErrorState({ title = "Couldn't load this list", message, onRetry }: QueryErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
      <AlertCircle className="text-danger h-6 w-6" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground max-w-md text-sm break-words">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
