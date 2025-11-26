import path from 'path'
import { test, expect } from '@playwright/test'

const distIndex = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
const BACKEND_URL = process.env.BACKEND_URL || ''
const FRONTEND_URL = process.env.FRONTEND_URL || ''

test.describe('Seed backend and verify UI', () => {
  const leadName = 'E2E Seed ' + Date.now()

  test.beforeAll(async ({ request }) => {
    if (BACKEND_URL) {
      // create a lead via mobile endpoint (no auth required in demo API)
      const lead = { name: leadName, email: `e2e+${Date.now()}@example.com`, lead_score: 0.5 }
      const r = await request.post(`${BACKEND_URL.replace(/\/$/, '')}/mobile/leads`, { data: lead })
      if (r.status() >= 400) {
        console.warn('Seed lead creation returned', r.status())
      }
    }
  })

  test('UI shows seeded lead', async ({ page }) => {
    const url = FRONTEND_URL || ('file://' + distIndex)
    await page.goto(url)

    // wait for lead list to render — select the first matching element to avoid strict-mode collisions
    const leadItem = page.locator(`text=${leadName}`).first()
    await expect(leadItem).toBeVisible({ timeout: 10_000 })
  })
})
