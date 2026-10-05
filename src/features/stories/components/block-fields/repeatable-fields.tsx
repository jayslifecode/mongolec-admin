'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ChaptersBlock, ChapterItem, StatItem, StatsBlock } from '../../types'

interface ChaptersFieldsProps {
  block: ChaptersBlock
  onChange: (block: ChaptersBlock) => void
  disabled?: boolean
}

const EMPTY_CHAPTER: ChapterItem = { title: '', subtitle: '', body: '', image: '' }
const EMPTY_STAT: StatItem = { value: '', label: '' }

export function ChaptersFields({ block, onChange, disabled }: ChaptersFieldsProps) {
  const updateItem = (index: number, updater: (item: ChapterItem) => ChapterItem) => {
    onChange({ ...block, items: block.items.map((item, i) => (i === index ? updater(item) : item)) })
  }

  const addItem = () => onChange({ ...block, items: [...block.items, { ...EMPTY_CHAPTER }] })

  const removeItem = (index: number) =>
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) })

  return (
    <div className="space-y-3">
      {block.items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-lg border border-border/60 p-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Chapter {index + 1}</Label>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <Input
            placeholder="Title *"
            value={item.title}
            onChange={(e) => updateItem(index, (it) => ({ ...it, title: e.target.value }))}
            disabled={disabled}
          />
          <Input
            placeholder="Subtitle"
            value={item.subtitle ?? ''}
            onChange={(e) => updateItem(index, (it) => ({ ...it, subtitle: e.target.value }))}
            disabled={disabled}
          />
          <Textarea
            placeholder="Body *"
            value={item.body}
            onChange={(e) => updateItem(index, (it) => ({ ...it, body: e.target.value }))}
            disabled={disabled}
            rows={3}
          />
          <Input
            placeholder="Image URL"
            value={item.image ?? ''}
            onChange={(e) => updateItem(index, (it) => ({ ...it, image: e.target.value }))}
            disabled={disabled}
          />
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Chapter
        </Button>
      )}
    </div>
  )
}

interface StatsFieldsProps {
  block: StatsBlock
  onChange: (block: StatsBlock) => void
  disabled?: boolean
}

export function StatsFields({ block, onChange, disabled }: StatsFieldsProps) {
  const updateItem = (index: number, updater: (item: StatItem) => StatItem) => {
    onChange({ ...block, items: block.items.map((item, i) => (i === index ? updater(item) : item)) })
  }

  const addItem = () => onChange({ ...block, items: [...block.items, { ...EMPTY_STAT }] })

  const removeItem = (index: number) =>
    onChange({ ...block, items: block.items.filter((_, i) => i !== index) })

  return (
    <div className="space-y-3">
      {block.items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Value *"
            value={item.value}
            onChange={(e) => updateItem(index, (it) => ({ ...it, value: e.target.value }))}
            disabled={disabled}
            className="w-32"
          />
          <Input
            placeholder="Label *"
            value={item.label}
            onChange={(e) => updateItem(index, (it) => ({ ...it, label: e.target.value }))}
            disabled={disabled}
          />
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Stat
        </Button>
      )}
    </div>
  )
}
