'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type {
  ClosingBlock,
  HeroBlock,
  ImageBlock,
  StatementBlock,
  TextBlock,
  VideoBlock,
} from '../../types'

interface FieldsProps<TBlock> {
  block: TBlock
  onChange: (block: TBlock) => void
  disabled?: boolean
}

export function HeroFields({ block, onChange, disabled }: FieldsProps<HeroBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Subtitle</Label>
        <Input
          value={block.subtitle ?? ''}
          onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Image URL *</Label>
        <Input
          value={block.image}
          onChange={(e) => onChange({ ...block, image: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Video URL</Label>
        <Input
          value={block.video ?? ''}
          onChange={(e) => onChange({ ...block, video: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export function StatementFields({ block, onChange, disabled }: FieldsProps<StatementBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Eyebrow</Label>
        <Input
          value={block.eyebrow ?? ''}
          onChange={(e) => onChange({ ...block, eyebrow: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Text *</Label>
        <Textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  )
}

export function TextFields({ block, onChange, disabled }: FieldsProps<TextBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ ...block, heading: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Body *</Label>
        <Textarea
          value={block.body}
          onChange={(e) => onChange({ ...block, body: e.target.value })}
          disabled={disabled}
          rows={5}
        />
      </div>
    </div>
  )
}

export function ImageFields({ block, onChange, disabled }: FieldsProps<ImageBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Image URL *</Label>
        <Input
          value={block.src}
          onChange={(e) => onChange({ ...block, src: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Caption</Label>
        <Input
          value={block.caption ?? ''}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor={`parallax-${block.src || 'new'}`}>Parallax effect</Label>
        <Switch
          id={`parallax-${block.src || 'new'}`}
          checked={!!block.parallax}
          onCheckedChange={(checked) => onChange({ ...block, parallax: checked })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export function VideoFields({ block, onChange, disabled }: FieldsProps<VideoBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Video URL *</Label>
        <Input
          value={block.src}
          onChange={(e) => onChange({ ...block, src: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Poster Image URL</Label>
        <Input
          value={block.poster ?? ''}
          onChange={(e) => onChange({ ...block, poster: e.target.value })}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export function ClosingFields({ block, onChange, disabled }: FieldsProps<ClosingBlock>) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Title *</Label>
        <Input
          value={block.title}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Subtitle</Label>
        <Input
          value={block.subtitle ?? ''}
          onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Image URL</Label>
        <Input
          value={block.image ?? ''}
          onChange={(e) => onChange({ ...block, image: e.target.value })}
          disabled={disabled}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label>CTA Label</Label>
          <Input
            value={block.cta?.label ?? ''}
            onChange={(e) =>
              onChange({ ...block, cta: { label: e.target.value, href: block.cta?.href ?? '' } })
            }
            disabled={disabled}
          />
        </div>
        <div className="space-y-1.5">
          <Label>CTA Link</Label>
          <Input
            value={block.cta?.href ?? ''}
            onChange={(e) =>
              onChange({ ...block, cta: { label: block.cta?.label ?? '', href: e.target.value } })
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
