import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Every admin page, in light, dark and at phone width: it renders a heading, throws no
 * errors, has no sideways scroll, and has no serious or critical accessibility problems.
 */
const PAGES = [
  '/',
  '/rallies',
  '/rallies/create',
  '/applications',
  '/participant-profiles',
  '/participant-profiles/create',
  '/ranger-profiles',
  '/team',
  '/stories',
  '/nominations',
  '/contact',
  '/newsletter',
  '/rangers',
  '/merch',
  '/merch/orders',
  '/merch/discounts',
  '/news',
  '/users',
  '/tenants',
]

/** Known, harmless noise: missing default avatar images. */
const IGNORED_CONSOLE = [/\/avatars\//, /favicon/]

async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = message.text()
    const location = message.location().url ?? ''
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text) || pattern.test(location))) return
    errors.push(`console: ${text}`)
  })
  return errors
}

for (const route of PAGES) {
  test(`${route} renders cleanly`, async ({ page }) => {
    const errors = await collectErrors(page)
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    await page.waitForLoadState('networkidle')

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, 'no sideways scroll').toBeLessThanOrEqual(1)

    // axe ships its own copy of the Playwright types; the page object is the same at runtime.
    type AxePage = ConstructorParameters<typeof AxeBuilder>[0]['page']
    const results = await new AxeBuilder({ page: page as unknown as AxePage }).analyze()
    const blocking = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')})`)
    expect(blocking, 'serious/critical accessibility problems').toEqual([])

    expect(errors, 'console and page errors').toEqual([])
  })
}
