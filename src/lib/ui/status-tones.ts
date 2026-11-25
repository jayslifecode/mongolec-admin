/**
 * The only colours a status chip may use. Most states are neutral grey; colour is kept for
 * meaning: success (done / active), warning (needs attention), danger (rejected / failed),
 * primary (the one thing to act on). All are theme tokens, so light and dark both work.
 */
export const STATUS_TONES = ['neutral', 'primary', 'success', 'warning', 'danger'] as const
export type StatusTone = (typeof STATUS_TONES)[number]

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary text-primary-foreground border-transparent',
  success: 'bg-success-muted text-success border-transparent',
  warning: 'bg-warning-muted text-warning border-transparent',
  danger: 'bg-danger-muted text-danger border-transparent',
}

export function toneClasses(tone: StatusTone): string {
  return TONE_CLASSES[tone]
}
