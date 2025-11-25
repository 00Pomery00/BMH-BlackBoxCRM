import path from 'path'
import { test, expect } from '@playwright/test'

const indexPath = path.resolve(__dirname, '..', '..', 'dist', 'index.html')

test.describe('App flows (file://)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('file://' + indexPath)
  })

  test('shows dashboard after open', async ({ page }) => {
    await expect(page).toHaveTitle(/BlackBox CRM/)
    // dashboard KPI card should be visible
    const kpi = page.locator('text=Leads')
    await expect(kpi).toBeVisible()
  })

  test('open lead detail modal and create a note', async ({ page }) => {
    // assume there is a lead list with at least one item; click first
    const firstLead = page.locator('[data-test=lead-item]').first()
    await expect(firstLead).toBeVisible()
    await firstLead.click()

    const modal = page.locator('[data-test=lead-detail-modal]')
    await expect(modal).toBeVisible()

    const noteInput = modal.locator('[data-test=lead-note-input]')
    await noteInput.fill('E2E note ' + Date.now())
    await modal.locator('[data-test=lead-note-save]').click()

    // assert note appears in activity list
    const activity = modal.locator('text=E2E note')
    await expect(activity).toBeVisible()
  })
})
