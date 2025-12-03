import { test } from '@playwright/test'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5173'
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8002'

test('debug companies page', async ({ page }) => {
  // collect console and page errors for debugging
  page.on('console', (m) => console.log('console>', m.type(), m.text()))
  page.on('pageerror', (e) => console.log('pageerror>', e.message))
  await page.addInitScript((b) => { try { (window as any).__BACKEND_URL = b } catch(e){} }, BACKEND_URL)
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem('bbx_token', 'e2e-demo-token')
      window.localStorage.setItem('bbx_session', JSON.stringify({ user_id: 1, session_id: 'e2e-session' }))
    } catch (e) {}
  })
  const url = `${FRONTEND_URL}/`
  console.log('Navigating to', url)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  // If login is shown, click the demo login button to enter the app
  const loginBtn = page.locator('[data-testid="login-button"]')
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginBtn.click()
    // reload so the app mounts as logged-in and re-fetches companies
    await page.waitForTimeout(500)
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 })
  }

  // After login, click sidebar 'Firmy' to show companies (app uses state router)
  const companiesBtn = page.locator('button:has-text("Firmy")')
  if (await companiesBtn.isVisible().catch(() => false)) {
    await companiesBtn.click()
    await page.waitForTimeout(500)
  }

  const content = await page.content()
  console.log('page length:', content.length)
  // Save screenshot
  await page.screenshot({ path: 'debug_companies.png', fullPage: true })
  // Print a snippet of content to logs
  console.log(content.slice(0, 4000))
})
