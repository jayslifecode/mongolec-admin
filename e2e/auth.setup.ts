import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/admin.json'

/** Signs in once and saves the session for the other tests (credentials come from the env). */
setup('sign in', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to run the admin browser tests')

  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'))
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.context().storageState({ path: AUTH_FILE })
})
