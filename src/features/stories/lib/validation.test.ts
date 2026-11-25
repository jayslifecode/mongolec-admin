import { describe, expect, test } from 'vitest'
import { validateStoryForm, type StoryFormValues } from './validation'

const valid: StoryFormValues = {
  title: { en: 'A story', mn: '' },
  slug: 'a-story',
  type: 'IMPACT',
  rallyId: null,
  excerpt: { en: '', mn: '' },
  featuredImage: '',
  impactSummary: {},
  author: { en: '', mn: '' },
  role: '',
}

describe('validateStoryForm featured image', () => {
  test('accepts an empty image', () => {
    expect(validateStoryForm(valid, []).fieldErrors.featuredImage).toBeUndefined()
  })

  test('accepts an https link', () => {
    expect(validateStoryForm({ ...valid, featuredImage: 'https://cdn.example.com/a.jpg' }, []).isValid).toBe(true)
  })

  test('rejects a link without a scheme', () => {
    expect(validateStoryForm({ ...valid, featuredImage: 'example.com/a.jpg' }, []).fieldErrors.featuredImage).toBeTruthy()
  })

  test('rejects a javascript: link', () => {
    expect(validateStoryForm({ ...valid, featuredImage: 'javascript:alert(1)' }, []).isValid).toBe(false)
  })
})

describe('validateStoryForm title', () => {
  test('requires the English title', () => {
    expect(validateStoryForm({ ...valid, title: { en: ' ', mn: 'x' } }, []).fieldErrors['title.en']).toBeTruthy()
  })
})
