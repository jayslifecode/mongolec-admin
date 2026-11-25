import { describe, expect, it } from 'vitest'
import { validateArticleForm, type ArticleFormInput } from './article-schema'

const valid: ArticleFormInput = {
  title_en: 'Rally begins',
  title_mn: 'Ралли эхэллээ',
  slug: 'rally-begins',
  featuredImage: '',
  socialImage: '',
  status: 'DRAFT',
  scheduledAt: '',
  metaTitle_en: '',
  metaTitle_mn: '',
  metaDescription_en: '',
  metaDescription_mn: '',
}

describe('validateArticleForm', () => {
  it('accepts a valid article', () => {
    expect(validateArticleForm(valid).fieldErrors).toEqual({})
  })

  it('reports an empty Mongolian title (the hidden-tab case)', () => {
    const r = validateArticleForm({ ...valid, title_mn: '' })
    expect(r.fieldErrors.title_mn).toBeTruthy()
    expect(r.firstErrorLanguage).toBe('mn')
  })

  it('prefers the first error in field order for the language switch', () => {
    const r = validateArticleForm({ ...valid, title_en: '', title_mn: '' })
    expect(r.firstErrorLanguage).toBe('en')
  })

  it('has no language when the error is not language-specific', () => {
    expect(validateArticleForm({ ...valid, slug: 'Bad Slug' }).firstErrorLanguage).toBeNull()
  })

  it('applies the slug rule', () => {
    expect(validateArticleForm({ ...valid, slug: 'Bad Slug' }).fieldErrors.slug).toBeTruthy()
  })

  it('accepts empty or https image URLs and rejects the rest', () => {
    expect(validateArticleForm({ ...valid, featuredImage: 'https://x.org/a.jpg' }).fieldErrors.featuredImage).toBeUndefined()
    expect(validateArticleForm({ ...valid, featuredImage: 'x.org/a.jpg' }).fieldErrors.featuredImage).toBeTruthy()
    expect(validateArticleForm({ ...valid, socialImage: 'javascript:alert(1)' }).fieldErrors.socialImage).toBeTruthy()
  })

  it('requires a schedule date only when scheduling', () => {
    expect(validateArticleForm({ ...valid, status: 'SCHEDULED' }).fieldErrors.scheduledAt).toBeTruthy()
    expect(validateArticleForm({ ...valid, status: 'SCHEDULED', scheduledAt: '2026-12-01T10:00' }).fieldErrors.scheduledAt).toBeUndefined()
  })

  it('limits SEO lengths', () => {
    expect(validateArticleForm({ ...valid, metaTitle_en: 'x'.repeat(61) }).fieldErrors.metaTitle_en).toBeTruthy()
    expect(validateArticleForm({ ...valid, metaDescription_mn: 'x'.repeat(161) }).fieldErrors.metaDescription_mn).toBeTruthy()
  })
})
