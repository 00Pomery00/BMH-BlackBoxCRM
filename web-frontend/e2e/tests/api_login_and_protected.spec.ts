import path from 'path'
import { test, expect } from '@playwright/test'

const distIndex = path.resolve(__dirname, '..', '..', 'dist', 'index.html')
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'
const FRONTEND_URL = process.env.FRONTEND_URL || ''

test('API login + verify protected UI', async ({ page, request }) => {
  const email = `e2e+${Date.now()}@example.com`
  const pwd = 'Test1234!'

  // Register user via fastapi-users endpoint
  const reg = await request.post(`${BACKEND_URL.replace(/\/$/, '')}/fu_auth/register`, {
    data: { email, password: pwd }
  })

  // Accept 201 or 400 (already exists); continue
  if (![200, 201, 400].includes(reg.status())) {
    throw new Error('Register failed: ' + reg.status())
  }

  // Login to get JWT
  const login = await request.post(`${BACKEND_URL.replace(/\/$/, '')}/fu_auth/jwt/login`, {
    data: { username: email, password: pwd }
  })
  if (login.status() !== 200) {
    throw new Error('Login failed: ' + login.status())
  }
  const json = await login.json()
  const accessToken = json.access_token || json['access_token'] || json.token || json.accessToken
  if (!accessToken) throw new Error('No access token in login response')

  // Prepare frontend and insert token into storage
  const url = FRONTEND_URL || ('file://' + distIndex)
  await page.goto(url)

  // Set token into localStorage under a few common keys; frontend should read one of them
  await page.evaluate((t) => {
    try { localStorage.setItem('auth_token', t) } catch(e){}
    try { localStorage.setItem('access_token', t) } catch(e){}
    try { localStorage.setItem('token', t) } catch(e){}
  }, accessToken)

  // reload so app picks up token
  await page.reload()

  // Expect a logged-in UI element (profile / logout / user email)
  const profile = page.locator('text=' + email)
  const logout = page.locator('text=Logout')
  await expect(profile.or(logout)).toBeVisible({ timeout: 5000 })
})
