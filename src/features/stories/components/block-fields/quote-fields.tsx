'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuoteBlock } from '../../types'

interface QuoteFieldsProps {
  block: QuoteBlock
  onChange: (block: QuoteBlock) => void
  disabled?: boolean
}

export function QuoteFields({ block, onChange, disabled }: QuoteFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Quote Text *</Label>
        <Textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          disabled={disabled}
          rows={3}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Author</Label>
          <Input
            value={block.author ?? ''}
            onChange={(e) => onChange({ ...block, author: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Meta (role, location, etc.)</Label>
          <Input
            value={block.meta ?? ''}
            onChange={(e) => onChange({ ...block, meta: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
