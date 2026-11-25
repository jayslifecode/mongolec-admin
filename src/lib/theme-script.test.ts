import { describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY, themeInitScript } from './theme-script'

/** Runs the inline script against a fake document, storage and media query. */
function run(stored: string | null, systemDark: boolean) {
  const classes = new Set<string>()
  const style: { colorScheme?: string } = {}
  const document = {
    documentElement: {
      classList: { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c) },
      style,
    },
  }
  const localStorage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) }
  const matchMedia = () => ({ matches: systemDark })
  new Function('document', 'localStorage', 'matchMedia', themeInitScript)(document, localStorage, matchMedia)
  return { classes: [...classes], colorScheme: style.colorScheme }
}

describe('themeInitScript (runs before the first paint, so dark mode never flashes light)', () => {
  it('follows the system setting by default', () => {
    expect(run(null, true)).toEqual({ classes: ['dark'], colorScheme: 'dark' })
    expect(run(null, false)).toEqual({ classes: ['light'], colorScheme: 'light' })
  })

  it('uses the theme the user picked over the system setting', () => {
    expect(run('light', true)).toEqual({ classes: ['light'], colorScheme: 'light' })
    expect(run('dark', false)).toEqual({ classes: ['dark'], colorScheme: 'dark' })
  })

  it('treats an unknown stored value as "system"', () => {
    expect(run('purple', true).classes).toEqual(['dark'])
  })
})
