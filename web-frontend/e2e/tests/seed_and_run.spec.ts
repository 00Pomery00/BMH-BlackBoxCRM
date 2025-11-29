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

  // helper: wait until backend /companies returns an entry with our lead name
  async function waitForSeed(request: any, timeout = 15000) {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      try {
        const resp = await request.get(`${BACKEND_URL.replace(/\/$/, '')}/companies`)
        if (resp.status() === 200) {
          const json = await resp.json()
          if (Array.isArray(json) && json.find((c: any) => (c.name || '').includes(leadName))) return true
        }
      } catch (e) {
        // ignore network hiccups and retry
      }
      await new Promise((r) => setTimeout(r, 500))
    }
    return false
  }

  test('UI shows seeded lead', async ({ page }) => {
    const url = FRONTEND_URL || ('file://' + distIndex)

    // if backend was used to seed, poll the backend until the seed is visible there
    if (BACKEND_URL) {
      const ok = await waitForSeed((global as any).request || (await (await import('@playwright/test')).request), 15000)
      // proceed even if polling failed — the page assertions will fail and surface errors
      if (!ok) console.warn('Timed out waiting for seed to appear in /companies')
    }

    // Inject BACKEND_URL into the page so the static build fetches the correct API
    if (BACKEND_URL) {
      await page.addInitScript((b) => { try { window.__BACKEND_URL = b } catch(e){} }, BACKEND_URL)
    }

    await page.goto(url)

    // wait for lead list to render — select the first matching element to avoid strict-mode collisions
    const leadItem = page.locator(`text=${leadName}`).first()
    await expect(leadItem).toBeVisible({ timeout: 10_000 })
  })
})
