const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

/**
 * Converts arbitrary text into a URL-friendly kebab-case slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validates that a slug is non-empty and strictly kebab-case
 * (lowercase letters, digits, and single hyphens between segments).
 */
export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}
