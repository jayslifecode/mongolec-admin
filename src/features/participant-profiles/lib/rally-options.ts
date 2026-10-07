export interface RallyOption {
  id: string
  title: string
  year: number
  startDate: string
}

/**
 * Sorts rally options by start date, most recent first. Returns a new
 * array — the input is never mutated.
 */
export function sortRalliesByStartDateDesc(rallies: RallyOption[]): RallyOption[] {
  return [...rallies].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )
}

/**
 * Filters rally options by a free-text search query, matching against the
 * title or year. An empty/whitespace query returns the full, unfiltered list.
 */
export function filterRallyOptions(rallies: RallyOption[], query: string): RallyOption[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return rallies

  return rallies.filter(
    (rally) =>
      rally.title.toLowerCase().includes(normalized) ||
      String(rally.year).includes(normalized),
  )
}
