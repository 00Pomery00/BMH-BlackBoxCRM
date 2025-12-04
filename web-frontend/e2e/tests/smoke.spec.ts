import path from 'path'
import { test, expect } from '@playwright/test'

test('homepage shows title (file)', async ({ page }) => {
  const indexPath = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
  await page.goto('file://' + indexPath, { waitUntil: 'load', timeout: 60_000 })
  await expect(page).toHaveTitle(/BlackBox CRM/, { timeout: 30_000 })
})
