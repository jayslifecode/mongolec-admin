/**
 * Application answers are stored in JSON columns. The public website saves them as small
 * objects ({ description }, { text }, { notes }, { links }, { locations, other }, or an
 * address { street, state, postalCode }), while older records hold plain strings. These
 * helpers turn any of those shapes into display text so the admin never renders a raw object.
 */

const MEDICAL_CERTIFICATION_LABELS: Record<string, string> = {
  doctor: 'Medical Doctor',
  wfr: 'Wilderness First Responder',
  wemt: 'Wilderness EMT',
}

const HOW_HEARD_LABELS: Record<string, string> = {
  social: 'Social Media',
  friend: 'Friend or Family',
  podcast: 'Podcast (Adventure Rider Radio)',
  search: 'Web Search',
  event: 'Event or Show',
  other: 'Other',
}

const OTHER_PREFIX = 'other:'
const LIST_SEPARATOR = ', '

/**
 * Postgres jsonb returns object keys shortest-first, not in the order the website wrote them,
 * so known keys are read in this reading order; any other keys follow in their stored order.
 */
const KEY_DISPLAY_ORDER = ['description', 'text', 'notes', 'links', 'locations', 'other', 'street', 'city', 'state', 'postalCode', 'country']

function orderedValues(record: object): unknown[] {
  const entries = Object.entries(record)
  const rank = (key: string): number => {
    const index = KEY_DISPLAY_ORDER.indexOf(key)
    return index === -1 ? KEY_DISPLAY_ORDER.length : index
  }
  return [...entries].sort(([a], [b]) => rank(a) - rank(b)).map(([, value]) => value)
}

function joinParts(parts: unknown[]): string | undefined {
  const texts = parts.map(formatResponse).filter((text): text is string => Boolean(text))
  return texts.length ? texts.join(LIST_SEPARATOR) : undefined
}

/** Turns a stored application answer (string, number, boolean, array or object) into display text. */
export function formatResponse(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string') return value.trim() ? value : undefined
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return joinParts(value)
  if (typeof value === 'object') return joinParts(orderedValues(value))
  return undefined
}

function trimmedOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:'])

/** Returns the value only when it is an absolute http(s) URL, so applicant text never becomes a script link. */
export function safeHttpUrl(value: string | null | undefined): string | undefined {
  const trimmed = trimmedOrUndefined(value)
  if (!trimmed) return undefined
  try {
    return SAFE_LINK_PROTOCOLS.has(new URL(trimmed).protocol) ? trimmed : undefined
  } catch {
    return undefined
  }
}

/** Label for the website's medical certification option value ('doctor', 'wfr', 'wemt'). */
export function medicalCertificationLabel(value: string | null | undefined): string | undefined {
  const trimmed = trimmedOrUndefined(value)
  if (!trimmed) return undefined
  return MEDICAL_CERTIFICATION_LABELS[trimmed] ?? trimmed
}

/** Label for the website's "how did you hear" value, including "other: <free text>". */
export function howHeardLabel(value: string | null | undefined): string | undefined {
  const trimmed = trimmedOrUndefined(value)
  if (!trimmed) return undefined
  if (trimmed.toLowerCase().startsWith(OTHER_PREFIX)) {
    const detail = trimmed.slice(OTHER_PREFIX.length).trim()
    return detail ? `Other: ${detail}` : 'Other'
  }
  return HOW_HEARD_LABELS[trimmed] ?? trimmed
}
