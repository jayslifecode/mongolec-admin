import { describe, expect, test } from 'vitest'
import { formatResponse, howHeardLabel, medicalCertificationLabel, roomingLabel, safeHttpUrl } from './format-response'

describe('safeHttpUrl', () => {
  test('accepts http and https links', () => {
    expect(safeHttpUrl('https://youtube.com/watch?v=abc')).toBe('https://youtube.com/watch?v=abc')
    expect(safeHttpUrl('  http://vimeo.com/1 ')).toBe('http://vimeo.com/1')
  })

  test('rejects script links, other protocols, bare text and empty values', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeHttpUrl('data:text/html,hi')).toBeUndefined()
    expect(safeHttpUrl('youtube.com/watch')).toBeUndefined()
    expect(safeHttpUrl(null)).toBeUndefined()
  })
})

describe('formatResponse', () => {
  test('returns plain strings unchanged', () => {
    expect(formatResponse('Ten years on dual-sport bikes')).toBe('Ten years on dual-sport bikes')
  })

  test('returns undefined for empty values', () => {
    expect(formatResponse(null)).toBeUndefined()
    expect(formatResponse(undefined)).toBeUndefined()
    expect(formatResponse('   ')).toBeUndefined()
    expect(formatResponse({})).toBeUndefined()
    expect(formatResponse({ description: '' })).toBeUndefined()
  })

  test('unwraps the single-field objects the website stores', () => {
    expect(formatResponse({ description: 'Rode across Mongolia' })).toBe('Rode across Mongolia')
    expect(formatResponse({ text: 'I love conservation' })).toBe('I love conservation')
    expect(formatResponse({ notes: 'Vegetarian' })).toBe('Vegetarian')
    expect(formatResponse({ links: 'instagram.com/rider' })).toBe('instagram.com/rider')
  })

  test('joins the street address parts in order and skips blanks', () => {
    const address = { street: '123 Main St', state: '', postalCode: '94102' }

    expect(formatResponse(address)).toBe('123 Main St, 94102')
  })

  test('lists future locations together with the free-text other location', () => {
    expect(formatResponse({ locations: ['Mongolia', 'Romania'], other: '' })).toBe('Mongolia, Romania')
    expect(formatResponse({ locations: ['Mongolia', 'Other'], other: 'Chile' })).toBe('Mongolia, Other, Chile')
  })

  test('keeps a readable order when the database returns keys reordered (jsonb sorts them)', () => {
    // Arrange: Postgres jsonb returns keys shortest-first, not in the order the website wrote them
    const address = { state: 'California', street: '123 Main St', postalCode: '94102' }
    const futureLocations = { other: 'Chile', locations: ['Mongolia', 'Other'] }

    // Act + Assert
    expect(formatResponse(address)).toBe('123 Main St, California, 94102')
    expect(formatResponse(futureLocations)).toBe('Mongolia, Other, Chile')
  })

  test('formats numbers and booleans as text', () => {
    expect(formatResponse(12)).toBe('12')
    expect(formatResponse(true)).toBe('Yes')
    expect(formatResponse(false)).toBe('No')
  })
})

describe('medicalCertificationLabel', () => {
  test('maps the website option values to their labels', () => {
    expect(medicalCertificationLabel('doctor')).toBe('Medical Doctor')
    expect(medicalCertificationLabel('wfr')).toBe('Wilderness First Responder')
    expect(medicalCertificationLabel('wemt')).toBe('Wilderness EMT')
  })

  test('passes unknown values through and ignores empty ones', () => {
    expect(medicalCertificationLabel('Paramedic')).toBe('Paramedic')
    expect(medicalCertificationLabel(null)).toBeUndefined()
  })
})

describe('howHeardLabel', () => {
  test('maps the website option values to their labels', () => {
    expect(howHeardLabel('social')).toBe('Social Media')
    expect(howHeardLabel('podcast')).toBe('Podcast (Adventure Rider Radio)')
  })

  test('shows the free text typed after "other:"', () => {
    expect(howHeardLabel('other: A friend at a moto show')).toBe('Other: A friend at a moto show')
  })

  test('passes unknown values through and ignores empty ones', () => {
    expect(howHeardLabel('Newspaper')).toBe('Newspaper')
    expect(howHeardLabel('')).toBeUndefined()
  })
})

describe('acceptance letter answers (round 4)', () => {
  test('reads a shipping address with the second street line right after the first', () => {
    const address = { city: 'Boston', state: 'MA', street: '1 Main St', country: 'USA', street2: 'Apt 4', postalCode: '02101' }
    expect(formatResponse(address)).toBe('1 Main St, Apt 4, Boston, MA, 02101, USA')
  })

  test('labels the rooming preference', () => {
    expect(roomingLabel('TWIN')).toBe('Twin room (with a roommate, included)')
    expect(roomingLabel('SINGLE')).toBe('Single room (at own expense)')
    expect(roomingLabel('OTHER')).toBe('OTHER')
    expect(roomingLabel(null)).toBeUndefined()
  })
})
