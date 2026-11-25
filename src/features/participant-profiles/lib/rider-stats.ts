interface RiderLike {
  isActive: boolean
}

export interface RiderStats {
  total: number
  active: number
  inactive: number
  /** True when the API holds more riders than were loaded, so active/inactive are partial. */
  isPartial: boolean
}

/** Total comes from the API's pagination.total; active/inactive from the loaded rows. */
export function computeRiderStats(riders: RiderLike[], serverTotal: number | undefined): RiderStats {
  const total = serverTotal ?? riders.length
  const active = riders.filter((r) => r.isActive).length
  return { total, active, inactive: riders.length - active, isPartial: riders.length < total }
}
