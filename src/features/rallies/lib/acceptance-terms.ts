/**
 * The amounts quoted in a rally's acceptance letter (stored as `rally.acceptanceTerms` JSON):
 * minimum contribution, deposit, non-refundable part, final payment due date and start city.
 * The form edits them as text; empty fields are dropped and nothing is saved when all are empty.
 */

export interface AcceptanceTerms {
  currency?: string
  minimumContribution?: number
  deposit?: number
  nonRefundable?: number
  finalPaymentDue?: string
  startCity?: string
}

export interface AcceptanceTermsForm {
  currency: string
  minimumContribution: string
  deposit: string
  nonRefundable: string
  finalPaymentDue: string
  startCity: string
}

const DEFAULT_CURRENCY = 'USD'

export const EMPTY_TERMS_FORM: AcceptanceTermsForm = {
  currency: DEFAULT_CURRENCY,
  minimumContribution: '',
  deposit: '',
  nonRefundable: '',
  finalPaymentDue: '',
  startCity: '',
}

function asText(value: unknown): string {
  return typeof value === 'number' || typeof value === 'string' ? String(value) : ''
}

export function termsToForm(terms: unknown): AcceptanceTermsForm {
  if (!terms || typeof terms !== 'object') return EMPTY_TERMS_FORM
  const stored = terms as Record<string, unknown>
  return {
    currency: asText(stored.currency) || DEFAULT_CURRENCY,
    minimumContribution: asText(stored.minimumContribution),
    deposit: asText(stored.deposit),
    nonRefundable: asText(stored.nonRefundable),
    finalPaymentDue: asText(stored.finalPaymentDue),
    startCity: asText(stored.startCity),
  }
}

function asAmount(text: string): number | undefined {
  const cleaned = text.replace(/[,\s]/g, '')
  if (!cleaned) return undefined
  const amount = Number(cleaned)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

export function termsFromForm(form: AcceptanceTermsForm): AcceptanceTerms | null {
  const amounts = {
    minimumContribution: asAmount(form.minimumContribution),
    deposit: asAmount(form.deposit),
    nonRefundable: asAmount(form.nonRefundable),
  }
  const finalPaymentDue = form.finalPaymentDue.trim() || undefined
  const startCity = form.startCity.trim() || undefined
  const hasAnything = Object.values(amounts).some((value) => value !== undefined) || finalPaymentDue || startCity
  if (!hasAnything) return null

  const terms: AcceptanceTerms = { currency: form.currency.trim() || DEFAULT_CURRENCY }
  for (const [key, value] of Object.entries(amounts)) {
    if (value !== undefined) terms[key as 'minimumContribution' | 'deposit' | 'nonRefundable'] = value
  }
  return {
    ...terms,
    ...(finalPaymentDue && { finalPaymentDue }),
    ...(startCity && { startCity }),
  }
}
