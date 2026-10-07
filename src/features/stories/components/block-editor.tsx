'use client'

import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { addBlock, moveBlock, removeBlock, updateBlock, validateBlock } from '../lib/blocks'
import { BLOCK_TYPE_LABELS, BLOCK_TYPES } from '../types'
import type { StoryBlock, StoryBlockType } from '../types'
import { ChaptersFields, StatsFields } from './block-fields/repeatable-fields'
import {
  ClosingFields,
  HeroFields,
  ImageFields,
  StatementFields,
  TextFields,
  VideoFields,
} from './block-fields/simple-fields'
import { GalleryFields } from './block-fields/gallery-fields'
import { QuoteFields } from './block-fields/quote-fields'

interface BlockEditorProps {
  blocks: StoryBlock[]
  onChange: (blocks: StoryBlock[]) => void
  disabled?: boolean
}

function BlockFields({
  block,
  onChange,
  disabled,
}: {
  block: StoryBlock
  onChange: (block: StoryBlock) => void
  disabled?: boolean
}) {
  switch (block.type) {
    case 'hero':
      return <HeroFields block={block} onChange={onChange} disabled={disabled} />
    case 'statement':
      return <StatementFields block={block} onChange={onChange} disabled={disabled} />
    case 'text':
      return <TextFields block={block} onChange={onChange} disabled={disabled} />
    case 'image':
      return <ImageFields block={block} onChange={onChange} disabled={disabled} />
    case 'gallery':
      return <GalleryFields block={block} onChange={onChange} disabled={disabled} />
    case 'quote':
      return <QuoteFields block={block} onChange={onChange} disabled={disabled} />
    case 'chapters':
      return <ChaptersFields block={block} onChange={onChange} disabled={disabled} />
    case 'stats':
      return <StatsFields block={block} onChange={onChange} disabled={disabled} />
    case 'video':
      return <VideoFields block={block} onChange={onChange} disabled={disabled} />
    case 'closing':
      return <ClosingFields block={block} onChange={onChange} disabled={disabled} />
    default:
      return null
  }
}

export function BlockEditor({ blocks, onChange, disabled }: BlockEditorProps) {
  const handleAdd = (type: StoryBlockType) => onChange(addBlock(blocks, type))
  const handleRemove = (index: number) => onChange(removeBlock(blocks, index))
  const handleMove = (index: number, direction: 'up' | 'down') => onChange(moveBlock(blocks, index, direction))
  const handleBlockChange = (index: number, nextBlock: StoryBlock) =>
    onChange(updateBlock(blocks, index, () => nextBlock))

  return (
    <div className="space-y-4">
      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground">No blocks yet. Add one below to start building the story.</p>
      )}

      {blocks.map((block, index) => {
        const errors = validateBlock(block)
        return (
          <div key={index} className="rounded-lg border border-border/60 bg-muted/20">
            <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {index + 1}. {BLOCK_TYPE_LABELS[block.type]}
              </span>
              {!disabled && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === blocks.length - 1}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-3">
              <BlockFields
                block={block}
                onChange={(nextBlock) => handleBlockChange(index, nextBlock)}
                disabled={disabled}
              />
              {errors.length > 0 && (
                <div className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{errors.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {!disabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {BLOCK_TYPES.map((type) => (
              <DropdownMenuItem key={type} onClick={() => handleAdd(type)}>
                {BLOCK_TYPE_LABELS[type]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
