import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Dashboard - Basic functionality
 * 
 * Tests cover:
 * - Dashboard loads with default widgets
 * - All widget categories render correctly
 * - Widget data displays properly
 * - Dashboard is responsive
 */

test.describe('Dashboard - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should load dashboard with default widgets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for dashboard to render
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Verify at least one widget is visible
    const widgets = page.locator('[data-testid^="widget-"]');
    await expect(widgets.first()).toBeVisible();
    
    // Check that multiple widgets are rendered (default config has 4+ widgets)
    const widgetCount = await widgets.count();
    expect(widgetCount).toBeGreaterThan(0);
  });

  test('should display KPI widgets with correct data', async ({ page }) => {
    await page.goto('/');
    
    // Wait for KPI widgets to load
    const kpiCustomers = page.locator('[data-testid="widget-kpi-customers"]');
    const kpiRevenue = page.locator('[data-testid="widget-kpi-revenue"]');
    
    // Verify KPI widgets are visible
    await expect(kpiCustomers).toBeVisible({ timeout: 5000 });
    await expect(kpiRevenue).toBeVisible({ timeout: 5000 });
    
    // Check that KPI values are displayed (numbers should be present)
    const customersValue = kpiCustomers.locator('.kpi-value');
    await expect(customersValue).toBeVisible();
    await expect(customersValue).toHaveText(/\d+/); // Should contain numbers
  });

  test('should display chart widgets', async ({ page }) => {
    await page.goto('/');
    
    // Wait for chart widgets to render
    const chartOpportunities = page.locator('[data-testid="widget-chart-opportunities"]');
    
    await expect(chartOpportunities).toBeVisible({ timeout: 5000 });
    
    // Verify chart container exists (Recharts renders SVG)
    const chartSvg = chartOpportunities.locator('svg');
    await expect(chartSvg).toBeVisible();
  });

  test('should display table widgets with data rows', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table widget to load
    const tableWidget = page.locator('[data-testid="widget-table-sales"]');
    
    await expect(tableWidget).toBeVisible({ timeout: 5000 });
    
    // Verify table has rows (at least header + 1 data row)
    const tableRows = tableWidget.locator('table tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Wait for dashboard to render
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Verify widgets stack vertically (grid should adapt)
    const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
    const boundingBox = await dashboard.boundingBox();
    
    // Dashboard should fit within mobile viewport width
    expect(boundingBox.width).toBeLessThanOrEqual(375);
    
    // Widgets should still be visible
    const widgets = page.locator('[data-testid^="widget-"]');
    await expect(widgets.first()).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Set empty widget configuration
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', JSON.stringify({
        enabledWidgets: [],
        widgetOrder: [],
        widgetConfigs: {}
      }));
    });
    
    await page.reload();
    
    // Dashboard should render without errors
    const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    // Should show empty state or builder
    const builder = page.locator('[data-testid="dashboard-builder"]');
    await expect(builder).toBeVisible();
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Filter out known benign errors (e.g., favicon 404)
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('favicon') && !err.includes('404')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navigation to be available
    const nav = page.locator('nav');
    await expect(nav).toBeVisible({ timeout: 5000 });
    
    // Click on different nav items (if available)
    const dashboardLink = page.locator('a[href*="dashboard"]').first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      
      // Verify URL changed or content updated
      await page.waitForLoadState('networkidle');
      const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
      await expect(dashboard).toBeVisible();
    }
  });
});

test.describe('Dashboard - Performance', () => {
  test('should load dashboard within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should render widgets without layout shift', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial render
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Get initial positions of widgets
    const widget1 = page.locator('[data-testid^="widget-"]').first();
    const initialBox = await widget1.boundingBox();
    
    // Wait a bit for any potential layout shifts
    await page.waitForTimeout(500);
    
    const finalBox = await widget1.boundingBox();
    
    // Position should not change significantly (allow 5px tolerance)
    expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5);
  });
});
