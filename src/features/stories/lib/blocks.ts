import type {
  ChaptersBlock,
  ClosingBlock,
  GalleryBlock,
  GalleryImage,
  HeroBlock,
  ImageBlock,
  QuoteBlock,
  StatementBlock,
  StatsBlock,
  StoryBlock,
  StoryBlockType,
  TextBlock,
  VideoBlock,
} from '../types'

/**
 * Builds a fresh, empty block for the given type with sensible defaults.
 * Pure function: never mutates anything, always returns a new object.
 */
export function createEmptyBlock(type: StoryBlockType): StoryBlock {
  switch (type) {
    case 'hero':
      return { type, title: '', subtitle: '', image: '', video: '' } satisfies HeroBlock
    case 'statement':
      return { type, eyebrow: '', text: '' } satisfies StatementBlock
    case 'text':
      return { type, heading: '', body: '' } satisfies TextBlock
    case 'image':
      return { type, src: '', caption: '', parallax: false } satisfies ImageBlock
    case 'gallery':
      return { type, images: [], layout: 'masonry' } satisfies GalleryBlock
    case 'quote':
      return { type, text: '', author: '', meta: '' } satisfies QuoteBlock
    case 'chapters':
      return { type, items: [] } satisfies ChaptersBlock
    case 'stats':
      return { type, items: [] } satisfies StatsBlock
    case 'video':
      return { type, src: '', poster: '' } satisfies VideoBlock
    case 'closing':
      return { type, title: '', subtitle: '', image: '' } satisfies ClosingBlock
    default: {
      const exhaustiveCheck: never = type
      throw new Error(`Unknown block type: ${exhaustiveCheck}`)
    }
  }
}

/** Appends a new block of the given type to the end of the list (immutable). */
export function addBlock(blocks: StoryBlock[], type: StoryBlockType): StoryBlock[] {
  return [...blocks, createEmptyBlock(type)]
}

/** Removes the block at `index` (immutable). */
export function removeBlock(blocks: StoryBlock[], index: number): StoryBlock[] {
  return blocks.filter((_, i) => i !== index)
}

/** Replaces the block at `index` with the result of `updater` (immutable). */
export function updateBlock(
  blocks: StoryBlock[],
  index: number,
  updater: (block: StoryBlock) => StoryBlock
): StoryBlock[] {
  return blocks.map((block, i) => (i === index ? updater(block) : block))
}

/** Moves the block at `index` one position up or down (immutable). No-op at boundaries. */
export function moveBlock(blocks: StoryBlock[], index: number, direction: 'up' | 'down'): StoryBlock[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= blocks.length) return blocks

  const next = [...blocks]
  const [moved] = next.splice(index, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

/**
 * Returns a list of human-readable validation errors for a single block.
 * An empty array means the block is valid.
 */
export function validateBlock(block: StoryBlock): string[] {
  const errors: string[] = []

  switch (block.type) {
    case 'hero':
      if (!block.title.trim()) errors.push('Hero block requires a title')
      if (!block.image.trim()) errors.push('Hero block requires an image')
      break
    case 'statement':
      if (!block.text.trim()) errors.push('Statement block requires text')
      break
    case 'text':
      if (!block.body.trim()) errors.push('Text block requires body content')
      break
    case 'image':
      if (!block.src.trim()) errors.push('Image block requires a source URL')
      break
    case 'gallery':
      if (block.images.length === 0) errors.push('Gallery block requires at least one image')
      if (block.images.some((image) => !image.src.trim())) {
        errors.push('Every gallery image requires a source URL')
      }
      break
    case 'quote':
      if (!block.text.trim()) errors.push('Quote block requires text')
      break
    case 'chapters':
      if (block.items.length === 0) errors.push('Chapters block requires at least one chapter')
      if (block.items.some((item) => !item.title.trim() || !item.body.trim())) {
        errors.push('Every chapter requires a title and body')
      }
      break
    case 'stats':
      if (block.items.length === 0) errors.push('Stats block requires at least one stat')
      if (block.items.some((item) => !item.value.trim() || !item.label.trim())) {
        errors.push('Every stat requires a value and label')
      }
      break
    case 'video':
      if (!block.src.trim()) errors.push('Video block requires a source URL')
      break
    case 'closing':
      if (!block.title.trim()) errors.push('Closing block requires a title')
      break
    default:
      break
  }

  return errors
}

/** Validates every block in a list, returning errors keyed by block index. */
export function validateBlocks(blocks: StoryBlock[]): Record<number, string[]> {
  return blocks.reduce<Record<number, string[]>>((acc, block, index) => {
    const errors = validateBlock(block)
    if (errors.length > 0) acc[index] = errors
    return acc
  }, {})
}

/**
 * Parses the "one URL per line" gallery textarea format into image objects.
 * Each line is either `url` or `url | caption`.
 */
export function parseGalleryText(text: string): GalleryImage[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [srcPart, captionPart] = line.split('|')
      const src = srcPart.trim()
      const caption = captionPart?.trim()
      return caption ? { src, caption } : { src }
    })
}

/** Serializes gallery images back into the "one URL per line" textarea format. */
export function serializeGalleryText(images: GalleryImage[]): string {
  return images.map((image) => (image.caption ? `${image.src} | ${image.caption}` : image.src)).join('\n')
}
