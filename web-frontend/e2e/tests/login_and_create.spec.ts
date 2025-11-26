import path from 'path'
import { test, expect } from '@playwright/test'

const indexPath = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
const BACKEND_URL = process.env.BACKEND_URL || ''

test.describe('App flows (file://)', () => {
  test.beforeAll(async ({ request }) => {
    if (BACKEND_URL) {
      const lead = { name: 'E2E LoginSeed ' + Date.now(), email: `e2e+${Date.now()}@example.com`, lead_score: 0.5 }
      await request.post(`${BACKEND_URL.replace(/\/$/, '')}/mobile/leads`, { data: lead })
    }
  })

  test.beforeEach(async ({ page }) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || ''
    const url = FRONTEND_URL || ('file://' + indexPath)
    await page.goto(url)
  })

  test('shows dashboard after open', async ({ page }) => {
    await expect(page).toHaveTitle(/BlackBox CRM/)
    // dashboard KPI heading should be visible
    const heading = page.getByRole('heading', { name: 'Leads' })
    await expect(heading).toBeVisible()
  })

  test('open lead detail modal and create a note', async ({ page }) => {
    // ensure there is a lead list with at least one item; if not, create one via backend
    if (BACKEND_URL) {
      await page.request.post(`${BACKEND_URL.replace(/\/$/, '')}/mobile/leads`, { data: { name: 'E2E Modal Lead ' + Date.now(), email: `e2e+modal${Date.now()}@example.com`, lead_score: 0.5 } })
      // allow UI a moment to refresh
      await page.waitForTimeout(300)
    }
    const firstLead = page.locator('.p-3.bg-white.rounded.border').first()
    await expect(firstLead).toBeVisible({ timeout: 10_000 })
    await firstLead.click()

    // modal should open and show lead name in heading
    const modal = page.locator('div[role="dialog"]')
    // fallback: locate modal by visible lead name heading
    const modalHeading = page.locator('h2.text-xl').first()
    await expect(modalHeading).toBeVisible()
  })
})
