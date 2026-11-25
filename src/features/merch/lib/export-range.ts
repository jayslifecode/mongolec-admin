export interface ExportRangeErrors {
  from?: string
  to?: string
}

/** Checks the custom export range (yyyy-mm-dd strings). Returns null when valid. */
export function validateExportRange(from: string, to: string): ExportRangeErrors | null {
  if (!from && !to) return { from: 'Pick a start date, an end date, or both', to: undefined }
  if (from && to && to < from) return { to: 'The end date must be on or after the start date' }
  return null
}
