import { defineConfig, devices } from '@playwright/test'

/**
 * Admin browser tests. They only read and submit empty/invalid forms: nothing is written.
 *
 * Run against a local admin that talks to the real API through the dev proxy, or against
 * production:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_BASE_URL=http://localhost:3100 npx playwright test
 */
const AUTH_FILE = 'e2e/.auth/admin.json'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  // The local dev server compiles each page on first visit.
  timeout: 60_000,
  workers: 3,
  reporter: [['list']],
  preserveOutput: 'failures-only',
  use: {
    baseURL: process.env.ADMIN_BASE_URL ?? 'http://localhost:3100',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'light',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'light', storageState: AUTH_FILE },
    },
    {
      name: 'dark',
      dependencies: ['setup'],
      testMatch: /pages\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, colorScheme: 'dark', storageState: AUTH_FILE },
    },
    {
      name: 'mobile',
      dependencies: ['setup'],
      testMatch: /pages\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, storageState: AUTH_FILE },
    },
  ],
})
