import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const distDir = path.resolve(__dirname, '..', '..', 'dist')

export default defineConfig({
  testDir: 'e2e/tests',
  timeout: 30_000,
  expect: { timeout: 5000 },
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Note: not starting webServer here; tests use file:// path to the built index.html
})
