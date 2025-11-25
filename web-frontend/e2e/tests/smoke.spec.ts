import path from 'path'
import { test, expect } from '@playwright/test'

test('homepage shows title (file)', async ({ page }) => {
  const indexPath = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
  await page.goto('file://' + indexPath)
  await expect(page).toHaveTitle(/BlackBox CRM/)
})
