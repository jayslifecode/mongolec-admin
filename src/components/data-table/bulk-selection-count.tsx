import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { X } from 'lucide-react'

interface BulkSelectionCountProps {
  selectedRowsCount: number
  onClear?: () => void
}

export function BulkSelectionCount({
  selectedRowsCount,
  onClear,
}: BulkSelectionCountProps) {
  if (selectedRowsCount === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {selectedRowsCount} selected
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <kbd className="text-xs">Esc</kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
