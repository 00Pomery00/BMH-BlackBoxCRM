import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardConfig } from './useDashboardConfig';

describe('useDashboardConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default config', () => {
    const { result } = renderHook(() => useDashboardConfig());

    expect(result.current.config).toBeDefined();
    expect(result.current.config.enabledWidgets).toBeDefined();
    expect(result.current.config.widgetConfigs).toBeDefined();
    expect(result.current.config.widgetOrder).toBeDefined();
  });

  it('should load config from localStorage', () => {
    const savedConfig = {
      enabledWidgets: ['kpi_customers', 'chart_opportunities'],
      widgetConfigs: {
        kpi_customers: { title: 'Total Customers' },
        chart_opportunities: { title: 'Opportunities Trend' },
      },
      widgetOrder: ['kpi_customers', 'chart_opportunities'],
    };

    localStorage.setItem('bbx_ui_settings', JSON.stringify({ dashboardConfig: savedConfig }));

    const { result } = renderHook(() => useDashboardConfig());

    expect(result.current.config).toEqual(savedConfig);
  });

  it('should update widget configs', () => {
    const { result } = renderHook(() => useDashboardConfig());

    const newConfigs = {
      kpi_customers: { title: 'Customers' },
      chart_opportunities: { title: 'Opportunities' },
    };

    act(() => {
      result.current.updateWidgetConfigs(newConfigs);
    });

    expect(result.current.config.widgetConfigs).toEqual(
      expect.objectContaining(newConfigs)
    );
  });

  it('should set enabled widgets', () => {
    const { result } = renderHook(() => useDashboardConfig());

    const newEnabledWidgets = ['kpi_customers', 'chart_opportunities', 'table_leads'];

    act(() => {
      result.current.setEnabledWidgets(newEnabledWidgets);
    });

    expect(result.current.config.enabledWidgets).toEqual(newEnabledWidgets);
  });

  it('should set widget order', () => {
    const { result } = renderHook(() => useDashboardConfig());

    const newOrder = ['chart_opportunities', 'kpi_customers', 'table_leads'];

    act(() => {
      result.current.setWidgetOrder(newOrder);
    });

    expect(result.current.config.widgetOrder).toEqual(newOrder);
  });

  it('should reset config to default', () => {
    const savedConfig = {
      enabledWidgets: ['kpi_customers', 'chart_opportunities'],
      widgetConfigs: { kpi_customers: { title: 'Customers' } },
      widgetOrder: ['kpi_customers', 'chart_opportunities'],
    };

    localStorage.setItem('bbx_ui_settings', JSON.stringify({ dashboardConfig: savedConfig }));

    const { result } = renderHook(() => useDashboardConfig());

    act(() => {
      result.current.reset();
    });

    expect(result.current.config).toEqual(result.current.meta.defaultConfig);
  });

  it('should validate config structure', () => {
    const { result } = renderHook(() => useDashboardConfig());

    expect(result.current.meta.isValid).toBe(true);
  });

  it('should persist changes to localStorage', () => {
    const { result } = renderHook(() => useDashboardConfig());

    const newConfigs = { kpi_customers: { title: 'Updated Customers' } };

    act(() => {
      result.current.updateWidgetConfigs(newConfigs);
    });

    const stored = JSON.parse(localStorage.getItem('bbx_ui_settings'));
    expect(stored.dashboardConfig.widgetConfigs).toEqual(
      expect.objectContaining(newConfigs)
    );
  });

  it('should merge widget configs on update', () => {
    const { result } = renderHook(() => useDashboardConfig());

    act(() => {
      result.current.updateWidgetConfigs({ widget1: { title: 'Widget 1' } });
    });

    act(() => {
      result.current.updateWidgetConfigs({ widget2: { title: 'Widget 2' } });
    });

    expect(result.current.config.widgetConfigs.widget1).toEqual({ title: 'Widget 1' });
    expect(result.current.config.widgetConfigs.widget2).toEqual({ title: 'Widget 2' });
  });

  it('should use default config when storage is invalid', () => {
    localStorage.setItem('bbx_ui_settings', JSON.stringify({ invalid: 'data' }));

    const { result } = renderHook(() => useDashboardConfig());

    expect(result.current.config).toEqual(result.current.meta.defaultConfig);
  });

  it('should handle complete config replacement', () => {
    const { result } = renderHook(() => useDashboardConfig());

    const newConfig = {
      enabledWidgets: ['new_widget'],
      widgetConfigs: { new_widget: { title: 'New' } },
      widgetOrder: ['new_widget'],
    };

    act(() => {
      result.current.setConfig(newConfig);
    });

    expect(result.current.config).toEqual(newConfig);
  });

  it('should provide functions for config manipulation', () => {
    const { result } = renderHook(() => useDashboardConfig());

    expect(typeof result.current.updateWidgetConfigs).toBe('function');
    expect(typeof result.current.setEnabledWidgets).toBe('function');
    expect(typeof result.current.setWidgetOrder).toBe('function');
    expect(typeof result.current.setConfig).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });
});

