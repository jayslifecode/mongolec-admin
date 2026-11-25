export interface LocalizedText {
  en: string
  mn: string
}

type LocalizedInput = string | { en?: string; mn?: string } | null | undefined

/**
 * The API returns one language per request (a plain string). Admin forms need both, otherwise saving
 * would overwrite the other language. Query once per language and merge here.
 */
export function mergeLocalized(en: LocalizedInput, mn: LocalizedInput): LocalizedText {
  if (en && typeof en === 'object') return { en: en.en ?? '', mn: en.mn ?? '' }
  const enText = typeof en === 'string' ? en : ''
  const mnText = typeof mn === 'string' ? mn : ''
  return { en: enText || mnText, mn: mnText || enText }
}
