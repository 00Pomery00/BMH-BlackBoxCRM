import { test, expect } from '@playwright/test'

const BACKEND_URL = process.env.BACKEND_URL || ''
const FRONTEND_URL = process.env.FRONTEND_URL || ''

test.describe('Seed multiple leads and verify UI list', () => {
  const prefix = 'E2E-Batch'
  test.beforeAll(async ({ request }) => {
    if (!BACKEND_URL) return
    // create 3 leads
    for (let i = 0; i < 3; i++) {
      const lead = { name: `${prefix} ${i}`, email: `e2e+${Date.now()}+${i}@example.com`, lead_score: 0.1 * i }
      const r = await request.post(`${BACKEND_URL.replace(/\/$/, '')}/mobile/leads`, { data: lead })
      if (r.status() >= 400) console.warn('seed failed', r.status())
    }
  })

  test('UI lists the seeded items', async ({ page }) => {
    const url = FRONTEND_URL || `file://${process.cwd()}/web-frontend/dist/index.html`
    await page.goto(url)
    // check at least one seeded item is visible
    await expect(page.locator('text=E2E-Batch').first()).toBeVisible({ timeout: 10_000 })
  })
})
