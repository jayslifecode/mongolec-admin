import { describe, expect, test } from 'vitest'
import {
  addBlock,
  createEmptyBlock,
  moveBlock,
  parseGalleryText,
  removeBlock,
  serializeGalleryText,
  updateBlock,
  validateBlock,
  validateBlocks,
} from './blocks'
import type { GalleryBlock, HeroBlock, StoryBlock, TextBlock } from '../types'

describe('createEmptyBlock', () => {
  test('creates a hero block with empty defaults', () => {
    // Act
    const block = createEmptyBlock('hero')

    // Assert
    expect(block).toEqual({ type: 'hero', title: '', subtitle: '', image: '', video: '' })
  })

  test('creates a gallery block with masonry as the default layout', () => {
    // Act
    const block = createEmptyBlock('gallery')

    // Assert
    expect(block).toEqual({ type: 'gallery', images: [], layout: 'masonry' })
  })
})

describe('addBlock', () => {
  test('appends a new block without mutating the original array', () => {
    // Arrange
    const original: StoryBlock[] = [createEmptyBlock('statement')]

    // Act
    const result = addBlock(original, 'text')

    // Assert
    expect(result).toHaveLength(2)
    expect(original).toHaveLength(1)
    expect(result[1]).toEqual({ type: 'text', heading: '', body: '' })
  })
})

describe('removeBlock', () => {
  test('removes the block at the given index without mutating the original array', () => {
    // Arrange
    const original: StoryBlock[] = [createEmptyBlock('hero'), createEmptyBlock('text'), createEmptyBlock('quote')]

    // Act
    const result = removeBlock(original, 1)

    // Assert
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.type)).toEqual(['hero', 'quote'])
    expect(original).toHaveLength(3)
  })
})

describe('updateBlock', () => {
  test('replaces only the targeted block, leaving others untouched', () => {
    // Arrange
    const original: StoryBlock[] = [createEmptyBlock('text'), createEmptyBlock('text')]

    // Act
    const result = updateBlock(original, 0, (block) => ({ ...(block as TextBlock), body: 'Hello' }))

    // Assert
    expect((result[0] as TextBlock).body).toBe('Hello')
    expect((result[1] as TextBlock).body).toBe('')
    expect((original[0] as TextBlock).body).toBe('')
  })
})

describe('moveBlock', () => {
  test('moves a block up by one position', () => {
    // Arrange
    const hero = createEmptyBlock('hero') as HeroBlock
    const text = { ...(createEmptyBlock('text') as TextBlock), heading: 'second' }
    const original: StoryBlock[] = [hero, text]

    // Act
    const result = moveBlock(original, 1, 'up')

    // Assert
    expect(result[0]).toBe(text)
    expect(result[1]).toBe(hero)
  })

  test('is a no-op when moving the first block up', () => {
    // Arrange
    const original: StoryBlock[] = [createEmptyBlock('hero'), createEmptyBlock('text')]

    // Act
    const result = moveBlock(original, 0, 'up')

    // Assert
    expect(result).toEqual(original)
  })

  test('is a no-op when moving the last block down', () => {
    // Arrange
    const original: StoryBlock[] = [createEmptyBlock('hero'), createEmptyBlock('text')]

    // Act
    const result = moveBlock(original, 1, 'down')

    // Assert
    expect(result).toEqual(original)
  })
})

describe('validateBlock', () => {
  test('flags a hero block missing its required image', () => {
    // Arrange
    const block: HeroBlock = { type: 'hero', title: 'A Title', image: '' }

    // Act
    const errors = validateBlock(block)

    // Assert
    expect(errors).toContain('Hero block requires an image')
  })

  test('returns no errors for a fully populated hero block', () => {
    // Arrange
    const block: HeroBlock = { type: 'hero', title: 'A Title', image: 'https://example.com/a.jpg' }

    // Act
    const errors = validateBlock(block)

    // Assert
    expect(errors).toEqual([])
  })

  test('flags a gallery block with no images', () => {
    // Arrange
    const block: GalleryBlock = { type: 'gallery', images: [], layout: 'masonry' }

    // Act
    const errors = validateBlock(block)

    // Assert
    expect(errors).toContain('Gallery block requires at least one image')
  })
})

describe('validateBlocks', () => {
  test('returns errors keyed by index, omitting valid blocks', () => {
    // Arrange
    const blocks: StoryBlock[] = [
      { type: 'hero', title: '', image: '' },
      { type: 'text', body: 'valid body' },
    ]

    // Act
    const result = validateBlocks(blocks)

    // Assert
    expect(Object.keys(result)).toEqual(['0'])
    expect(result[0]).toEqual(['Hero block requires a title', 'Hero block requires an image'])
  })
})

describe('parseGalleryText', () => {
  test('parses plain URLs, one per line', () => {
    // Act
    const result = parseGalleryText('https://a.com/1.jpg\nhttps://a.com/2.jpg')

    // Assert
    expect(result).toEqual([{ src: 'https://a.com/1.jpg' }, { src: 'https://a.com/2.jpg' }])
  })

  test('parses a caption separated by a pipe', () => {
    // Act
    const result = parseGalleryText('https://a.com/1.jpg | A lovely sunset')

    // Assert
    expect(result).toEqual([{ src: 'https://a.com/1.jpg', caption: 'A lovely sunset' }])
  })

  test('ignores blank lines', () => {
    // Act
    const result = parseGalleryText('https://a.com/1.jpg\n\n   \nhttps://a.com/2.jpg')

    // Assert
    expect(result).toHaveLength(2)
  })
})

describe('serializeGalleryText', () => {
  test('round-trips through parseGalleryText', () => {
    // Arrange
    const text = 'https://a.com/1.jpg\nhttps://a.com/2.jpg | caption two'

    // Act
    const roundTripped = serializeGalleryText(parseGalleryText(text))

    // Assert
    expect(roundTripped).toBe(text)
  })
})
