import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const distDir = path.resolve(__dirname, '..', '..', 'dist')

export default defineConfig({
  // Use absolute path to the tests directory inside `e2e` so Playwright
  // always locates the specs regardless of the CWD used to run it.
  testDir: path.resolve(__dirname, 'tests'),
  timeout: 30_000,
  expect: { timeout: 5000 },
  retries: 0,
  // Collect useful artifacts for CI/debugging: traces, screenshots and videos
  outputDir: path.resolve(__dirname, '..', 'test-results'),
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    // Keep screenshots/videos/traces on failure for easier debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporters: [
    ['list'],
    ['html', { outputFolder: path.resolve(__dirname, '..', 'playwright-report'), open: 'never' }]
  ],
  // Note: not starting webServer here; tests use served `dist` in CI/local helper.
})
