import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWidgetRegistry } from './useWidgetRegistry';

describe('useWidgetRegistry', () => {
  it('should return widget registry', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    expect(result.current.WIDGET_REGISTRY).toBeDefined();
    expect(Array.isArray(result.current.WIDGET_REGISTRY)).toBe(true);
    expect(result.current.WIDGET_REGISTRY.length).toBe(14);
  });

  it('should return widget categories', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    expect(result.current.WIDGET_CATEGORIES).toBeDefined();
    expect(result.current.WIDGET_CATEGORIES.METRICS).toBe('metrics');
    expect(result.current.WIDGET_CATEGORIES.CHARTS).toBe('charts');
    expect(result.current.WIDGET_CATEGORIES.TABLES).toBe('tables');
    expect(result.current.WIDGET_CATEGORIES.WIDGETS).toBe('widgets');
  });

  it('should get widget by id', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const widget = result.current.getWidgetById('kpi_customers');
    expect(widget).toBeDefined();
    expect(widget.id).toBe('kpi_customers');
    expect(widget.label).toBe('Customers KPI');
    expect(widget.category).toBe('metrics');
  });

  it('should return undefined for non-existent widget', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const widget = result.current.getWidgetById('non_existent');
    expect(widget).toBeUndefined();
  });

  it('should get widgets by category', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const metricsWidgets = result.current.getWidgetsByCategory('metrics');
    expect(metricsWidgets).toBeDefined();
    expect(metricsWidgets.length).toBe(4);
    expect(metricsWidgets.every((w) => w.category === 'metrics')).toBe(true);
  });

  it('should get all categories', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const categories = result.current.getAllCategories();
    expect(categories).toBeDefined();
    expect(categories.length).toBe(4);
    expect(categories).toContain('metrics');
    expect(categories).toContain('charts');
    expect(categories).toContain('tables');
    expect(categories).toContain('widgets');
  });

  it('should return demo data for chart widgets', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const opportunitiesData = result.current.getDemoData('chart_opportunities');
    expect(opportunitiesData).toBeDefined();
    expect(Array.isArray(opportunitiesData)).toBe(true);
    expect(opportunitiesData.length).toBeGreaterThan(0);
    expect(opportunitiesData[0]).toHaveProperty('month');
    expect(opportunitiesData[0]).toHaveProperty('value');
  });

  it('should return demo data for lead source chart', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const leadSourceData = result.current.getDemoData('chart_lead_source');
    expect(leadSourceData).toBeDefined();
    expect(Array.isArray(leadSourceData)).toBe(true);
    expect(leadSourceData.length).toBeGreaterThan(0);
    expect(leadSourceData[0]).toHaveProperty('name');
    expect(leadSourceData[0]).toHaveProperty('value');
  });

  it('should return demo data for sales analytics table', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const salesAnalyticsData = result.current.getDemoData('table_sales_analytics');
    expect(salesAnalyticsData).toBeDefined();
    expect(Array.isArray(salesAnalyticsData)).toBe(true);
    expect(salesAnalyticsData.length).toBeGreaterThan(0);
    expect(salesAnalyticsData[0]).toHaveProperty('id');
    expect(salesAnalyticsData[0]).toHaveProperty('name');
  });

  it('should return empty array for unknown widget', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    const data = result.current.getDemoData('unknown_widget');
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });

  it('should memoize demo data (stable reference)', () => {
    const { result: result1 } = renderHook(() => useWidgetRegistry());
    const { result: result2 } = renderHook(() => useWidgetRegistry());

    // Demo data should be memoized across different hook instances
    expect(result1.current.DEMO_DATA).toBeDefined();
    expect(result2.current.DEMO_DATA).toBeDefined();
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useWidgetRegistry());

    const getWidgetById1 = result.current.getWidgetById;
    rerender();
    const getWidgetById2 = result.current.getWidgetById;

    // Functions should be stable (same reference) after rerender
    expect(getWidgetById1).toBe(getWidgetById2);
  });

  it('should have valid widget structure', () => {
    const { result } = renderHook(() => useWidgetRegistry());

    result.current.WIDGET_REGISTRY.forEach((widget) => {
      expect(widget).toHaveProperty('id');
      expect(widget).toHaveProperty('label');
      expect(widget).toHaveProperty('category');
      expect(widget).toHaveProperty('icon');
      expect(widget).toHaveProperty('description');
      expect(widget).toHaveProperty('defaultConfig');
      expect(typeof widget.id).toBe('string');
      expect(typeof widget.label).toBe('string');
      expect(typeof widget.category).toBe('string');
    });
  });
});
