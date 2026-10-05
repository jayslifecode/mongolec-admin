import { describe, expect, test } from 'vitest'
import { isValidSlug, slugify } from './slugify'

describe('slugify', () => {
  test('converts a simple title to kebab-case', () => {
    // Arrange
    const title = 'Our First Rally Story'

    // Act
    const result = slugify(title)

    // Assert
    expect(result).toBe('our-first-rally-story')
  })

  test('collapses punctuation and repeated separators into single hyphens', () => {
    // Arrange
    const title = "Ranger's Journey:  Beyond the Gobi!!"

    // Act
    const result = slugify(title)

    // Assert
    expect(result).toBe('ranger-s-journey-beyond-the-gobi')
  })

  test('trims leading and trailing hyphens', () => {
    // Arrange
    const title = '  -- Leading and trailing -- '

    // Act
    const result = slugify(title)

    // Assert
    expect(result).toBe('leading-and-trailing')
  })

  test('strips diacritics into their base latin characters', () => {
    // Arrange
    const title = 'Café de Ñoño'

    // Act
    const result = slugify(title)

    // Assert
    expect(result).toBe('cafe-de-nono')
  })

  test('returns an empty string when given no usable characters', () => {
    // Arrange
    const title = '   ***   '

    // Act
    const result = slugify(title)

    // Assert
    expect(result).toBe('')
  })
})

describe('isValidSlug', () => {
  test('accepts a well-formed kebab-case slug', () => {
    expect(isValidSlug('our-first-rally-story')).toBe(true)
  })

  test('accepts a single-word slug', () => {
    expect(isValidSlug('impact')).toBe(true)
  })

  test('rejects an empty string', () => {
    expect(isValidSlug('')).toBe(false)
  })

  test('rejects uppercase characters', () => {
    expect(isValidSlug('Our-Story')).toBe(false)
  })

  test('rejects spaces', () => {
    expect(isValidSlug('our story')).toBe(false)
  })

  test('rejects double hyphens', () => {
    expect(isValidSlug('our--story')).toBe(false)
  })

  test('rejects leading or trailing hyphens', () => {
    expect(isValidSlug('-our-story-')).toBe(false)
  })
})
