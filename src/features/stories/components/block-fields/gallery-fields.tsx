'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseGalleryText, serializeGalleryText } from '../../lib/blocks'
import type { GalleryBlock } from '../../types'

interface GalleryFieldsProps {
  block: GalleryBlock
  onChange: (block: GalleryBlock) => void
  disabled?: boolean
}

export function GalleryFields({ block, onChange, disabled }: GalleryFieldsProps) {
  const [text, setText] = useState(() => serializeGalleryText(block.images))

  const handleTextChange = (value: string) => {
    setText(value)
    onChange({ ...block, images: parseGalleryText(value) })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Images *</Label>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={'https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg | Optional caption'}
          disabled={disabled}
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          One image URL per line. Add an optional caption with <code>url | caption</code>.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label>Layout *</Label>
        <Select
          value={block.layout}
          onValueChange={(value) => onChange({ ...block, layout: value as GalleryBlock['layout'] })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masonry">Masonry</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="fullscreen">Fullscreen</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
