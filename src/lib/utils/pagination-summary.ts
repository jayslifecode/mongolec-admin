/** "Showing 11–20 of 127" for a table page (1-based page number). */
export function paginationSummary(total: number, page: number, pageSize: number): string {
  if (total <= 0) return 'No results'
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  return first === last ? `Showing ${first} of ${total}` : `Showing ${first}–${last} of ${total}`
}
