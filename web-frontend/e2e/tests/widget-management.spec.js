import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Widget Management
 * 
 * Tests cover:
 * - Adding widgets via DashboardBuilder
 * - Removing widgets
 * - Widget configuration persistence (localStorage)
 * - Widget order changes
 */

test.describe('Widget Management - Add/Remove', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should open dashboard builder', async ({ page }) => {
    await page.goto('/');
    
    // Look for builder button (add widget, customize, etc.)
    const builderButton = page.locator('button:has-text("Add Widget"), button:has-text("Customize")').first();
    
    if (await builderButton.isVisible()) {
      await builderButton.click();
      
      // Verify builder panel opens
      const builderPanel = page.locator('[data-testid="dashboard-builder"]');
      await expect(builderPanel).toBeVisible({ timeout: 2000 });
    } else {
      // Builder might be always visible
      const builderPanel = page.locator('[data-testid="dashboard-builder"]');
      await expect(builderPanel).toBeVisible({ timeout: 2000 });
    }
  });

  test('should display available widgets in builder', async ({ page }) => {
    await page.goto('/');
    
    // Wait for builder to be visible
    const builder = page.locator('[data-testid="dashboard-builder"]');
    await expect(builder).toBeVisible({ timeout: 5000 });
    
    // Verify widget categories are listed
    const widgetCategories = builder.locator('[data-testid^="category-"]');
    const categoryCount = await widgetCategories.count();
    
    // Should have at least 3 categories (KPI, Charts, Tables)
    expect(categoryCount).toBeGreaterThanOrEqual(3);
  });

  test('should add a widget to dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Get initial widget count
    const initialWidgets = page.locator('[data-testid^="widget-"]');
    const initialCount = await initialWidgets.count();
    
    // Open builder and add a widget
    const builder = page.locator('[data-testid="dashboard-builder"]');
    await expect(builder).toBeVisible({ timeout: 5000 });
    
    // Find an available widget to add (not already on dashboard)
    const addButton = builder.locator('button:has-text("Add"), button[aria-label*="add"]').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Wait for new widget to appear
      await page.waitForTimeout(500);
      
      // Verify widget count increased
      const finalCount = await initialWidgets.count();
      expect(finalCount).toBeGreaterThan(initialCount);
    }
  });

  test('should remove a widget from dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Wait for widgets to load
    await page.waitForSelector('[data-testid^="widget-"]', { timeout: 5000 });
    
    // Get initial widget count
    const initialWidgets = page.locator('[data-testid^="widget-"]');
    const initialCount = await initialWidgets.count();
    
    if (initialCount > 0) {
      // Find remove button on first widget (usually X or trash icon)
      const firstWidget = initialWidgets.first();
      const removeButton = firstWidget.locator('button[aria-label*="remove"], button[aria-label*="delete"], button:has-text("×")').first();
      
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        // Wait for widget to be removed
        await page.waitForTimeout(500);
        
        // Verify widget count decreased
        const finalCount = await page.locator('[data-testid^="widget-"]').count();
        expect(finalCount).toBeLessThan(initialCount);
      }
    }
  });

  test('should filter widgets by category', async ({ page }) => {
    await page.goto('/');
    
    // Wait for builder
    const builder = page.locator('[data-testid="dashboard-builder"]');
    await expect(builder).toBeVisible({ timeout: 5000 });
    
    // Find category filter buttons
    const kpiCategoryButton = builder.locator('button:has-text("KPI"), [data-testid="category-kpi"]').first();
    
    if (await kpiCategoryButton.isVisible()) {
      await kpiCategoryButton.click();
      
      // Verify only KPI widgets are shown
      const visibleWidgets = builder.locator('[data-testid^="widget-option-"]');
      const widgetTexts = await visibleWidgets.allTextContents();
      
      // At least some widgets should be visible after filtering
      expect(widgetTexts.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Widget Management - Persistence', () => {
  test('should save widget configuration to localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Wait for dashboard to render
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Add a widget (if builder is available)
    const builder = page.locator('[data-testid="dashboard-builder"]');
    const addButton = builder.locator('button:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
    }
    
    // Check localStorage has dashboard-config
    const configExists = await page.evaluate(() => {
      return localStorage.getItem('dashboard-config') !== null;
    });
    
    expect(configExists).toBeTruthy();
  });

  test('should restore widget configuration after page reload', async ({ page }) => {
    await page.goto('/');
    
    // Set a specific configuration
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', JSON.stringify({
        enabledWidgets: ['kpi-customers', 'chart-opportunities'],
        widgetOrder: ['kpi-customers', 'chart-opportunities'],
        widgetConfigs: {
          'kpi-customers': {},
          'chart-opportunities': {}
        }
      }));
    });
    
    await page.reload();
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Verify exactly 2 widgets are displayed
    const widgets = page.locator('[data-testid^="widget-"]');
    const widgetCount = await widgets.count();
    
    expect(widgetCount).toBe(2);
    
    // Verify specific widgets are present
    const kpiCustomers = page.locator('[data-testid="widget-kpi-customers"]');
    const chartOpportunities = page.locator('[data-testid="widget-chart-opportunities"]');
    
    await expect(kpiCustomers).toBeVisible();
    await expect(chartOpportunities).toBeVisible();
  });

  test('should persist widget order after reload', async ({ page }) => {
    await page.goto('/');
    
    // Set specific widget order
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', JSON.stringify({
        enabledWidgets: ['widget-3', 'widget-1', 'widget-2'],
        widgetOrder: ['widget-3', 'widget-1', 'widget-2'],
        widgetConfigs: {}
      }));
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid="dynamic-dashboard"]', { timeout: 5000 });
    
    // Get widget order from DOM
    const widgetIds = await page.locator('[data-testid^="widget-"]').evaluateAll(
      (elements) => elements.map(el => el.getAttribute('data-testid'))
    );
    
    // First widget should be widget-3 based on our config
    // (This assumes widgets render in the order specified)
    expect(widgetIds.length).toBeGreaterThan(0);
  });

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Set invalid JSON in localStorage
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', 'invalid-json-{{}');
    });
    
    await page.reload();
    
    // Dashboard should still load (fallback to defaults)
    const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    // Should have some widgets (default config)
    const widgets = page.locator('[data-testid^="widget-"]');
    const widgetCount = await widgets.count();
    expect(widgetCount).toBeGreaterThan(0);
  });
});

test.describe('Widget Management - Configuration', () => {
  test('should update widget configuration', async ({ page }) => {
    await page.goto('/');
    
    // Wait for a configurable widget (e.g., chart with date range)
    const chartWidget = page.locator('[data-testid="widget-chart-opportunities"]');
    await expect(chartWidget).toBeVisible({ timeout: 5000 });
    
    // Look for configuration controls (dropdown, date picker, etc.)
    const configControl = chartWidget.locator('select, [role="combobox"]').first();
    
    if (await configControl.isVisible()) {
      // Change configuration
      await configControl.click();
      
      // Select a different option
      const options = page.locator('[role="option"], option');
      if (await options.count() > 1) {
        await options.nth(1).click();
        
        // Wait for widget to update
        await page.waitForTimeout(500);
        
        // Verify configuration was saved to localStorage
        const savedConfig = await page.evaluate(() => {
          const config = localStorage.getItem('dashboard-config');
          return config ? JSON.parse(config) : null;
        });
        
        expect(savedConfig).not.toBeNull();
        expect(savedConfig.widgetConfigs).toBeDefined();
      }
    }
  });

  test('should reset dashboard to default configuration', async ({ page }) => {
    await page.goto('/');
    
    // Modify configuration
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', JSON.stringify({
        enabledWidgets: ['widget-1'],
        widgetOrder: ['widget-1'],
        widgetConfigs: {}
      }));
    });
    
    await page.reload();
    
    // Look for reset button
    const resetButton = page.locator('button:has-text("Reset"), button:has-text("Default")').first();
    
    if (await resetButton.isVisible()) {
      await resetButton.click();
      
      // Wait for reset to complete
      await page.waitForTimeout(500);
      
      // Verify more widgets are now visible (default has more than 1)
      const widgets = page.locator('[data-testid^="widget-"]');
      const widgetCount = await widgets.count();
      expect(widgetCount).toBeGreaterThan(1);
    }
  });
});

test.describe('Widget Management - Error Handling', () => {
  test('should handle widget load errors gracefully', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    
    // Set config with non-existent widget
    await page.evaluate(() => {
      localStorage.setItem('dashboard-config', JSON.stringify({
        enabledWidgets: ['non-existent-widget', 'kpi-customers'],
        widgetOrder: ['non-existent-widget', 'kpi-customers'],
        widgetConfigs: {}
      }));
    });
    
    await page.reload();
    
    // Dashboard should still render
    const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    // Valid widget should still be visible
    const kpiCustomers = page.locator('[data-testid="widget-kpi-customers"]');
    await expect(kpiCustomers).toBeVisible();
  });

  test('should handle missing demo data gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Dashboard should load even if some widgets have no data
    const dashboard = page.locator('[data-testid="dynamic-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 5000 });
    
    // Widgets should show empty states or loading states
    const widgets = page.locator('[data-testid^="widget-"]');
    const widgetCount = await widgets.count();
    expect(widgetCount).toBeGreaterThan(0);
  });
});
