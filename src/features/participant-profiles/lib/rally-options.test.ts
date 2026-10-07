import { describe, expect, test } from 'vitest'
import { filterRallyOptions, sortRalliesByStartDateDesc, type RallyOption } from './rally-options'

const rallies: RallyOption[] = [
  { id: '1', title: 'Gobi Expedition', year: 2023, startDate: '2023-06-01' },
  { id: '2', title: 'Altai Crossing', year: 2025, startDate: '2025-07-15' },
  { id: '3', title: 'Khangai Ride', year: 2024, startDate: '2024-05-10' },
]

describe('sortRalliesByStartDateDesc', () => {
  test('orders rallies from most recent start date to oldest', () => {
    // Arrange / Act
    const result = sortRalliesByStartDateDesc(rallies)

    // Assert
    expect(result.map((r) => r.id)).toEqual(['2', '3', '1'])
  })

  test('does not mutate the input array', () => {
    // Arrange
    const original = [...rallies]

    // Act
    sortRalliesByStartDateDesc(rallies)

    // Assert
    expect(rallies).toEqual(original)
  })
})

describe('filterRallyOptions', () => {
  test('returns all rallies when the query is empty', () => {
    expect(filterRallyOptions(rallies, '')).toEqual(rallies)
  })

  test('returns all rallies when the query is only whitespace', () => {
    expect(filterRallyOptions(rallies, '   ')).toEqual(rallies)
  })

  test('matches rallies by a case-insensitive title substring', () => {
    // Arrange / Act
    const result = filterRallyOptions(rallies, 'altai')

    // Assert
    expect(result.map((r) => r.id)).toEqual(['2'])
  })

  test('matches rallies by year', () => {
    // Arrange / Act
    const result = filterRallyOptions(rallies, '2024')

    // Assert
    expect(result.map((r) => r.id)).toEqual(['3'])
  })

  test('returns an empty array when nothing matches', () => {
    expect(filterRallyOptions(rallies, 'no-match')).toEqual([])
  })
})
