import { test, expect } from '@playwright/test'

/**
 * Create forms refuse empty or invalid input with inline, announced errors, and never save.
 * Nothing in this file writes data: every submission is rejected in the browser.
 */
const CREATE_FORMS = [
  '/rallies/create',
  '/participant-profiles/create',
  '/ranger-profiles/create',
  '/team/create',
  '/rangers/create',
  '/stories/create',
  '/merch/products/create',
  '/merch/discounts/create',
  '/merch/categories/create',
  '/news/create',
  '/news/categories/create',
  '/tenants/create',
]

for (const route of CREATE_FORMS) {
  test(`${route}: an empty form shows inline errors and does not save`, async ({ page }) => {
    let mutations = 0
    page.on('request', (request) => {
      if (request.method() === 'POST' && /mutation\s+Create|"operationName":"Create/i.test(request.postData() ?? '')) mutations += 1
    })
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    await page.locator('form button[type="submit"]').first().click()

    await expect(page.locator('[aria-invalid="true"]').first()).toBeVisible()
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`${route.replace(/\//g, '\\/')}$`))
    expect(mutations, 'no create request was sent').toBe(0)
  })
}

test('rally form: an end date before the start date is refused next to the end date', async ({ page }) => {
  await page.goto('/rallies/create')
  await page.waitForLoadState('networkidle')
  await page.getByLabel(/Title/).first().fill('ZZ E2E (never saved)')
  await page.getByLabel(/Start Date/i).fill('2030-08-10')
  await page.getByLabel(/End Date/i).fill('2030-08-01')
  await page.locator('form button[type="submit"]').first().click()
  await expect(page.getByText(/end date must be on or after the start date/i).first()).toBeVisible()
  await expect(page).toHaveURL(/\/rallies\/create$/)
})
