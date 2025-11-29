import path from 'path'
import { test, expect } from '@playwright/test'

const distIndex = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
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

  // helper: wait until backend /companies returns at least N entries for this prefix
  async function waitForSeeds(request: any, count = 3, timeout = 15000) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      try {
        const resp = await request.get(`${BACKEND_URL.replace(/\/$/, '')}/companies`)
        if (resp.status() === 200) {
          const json = await resp.json()
          if (Array.isArray(json)) {
            const matches = json.filter((c: any) => (c.name || '').startsWith(prefix))
            if (matches.length >= count) return true
          }
        }
      } catch (e) {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    return false
  }

  test('UI lists the seeded items', async ({ page }) => {
    const url = FRONTEND_URL || ('file://' + distIndex)
    // if backend was used, wait until seeding is visible on the backend
    if (BACKEND_URL) {
      const ok = await waitForSeeds((global as any).request || (await (await import('@playwright/test')).request), 3, 15000)
    }
      // Inject BACKEND_URL into the page before navigation so the static build queries mock backend
      await page.addInitScript((b) => { try { window.__BACKEND_URL = b } catch(e){} }, BACKEND_URL)
      await page.goto(url)
    // check at least one seeded item is visible
    await expect(page.locator('text=E2E-Batch').first()).toBeVisible({ timeout: 15_000 })
  })
})
