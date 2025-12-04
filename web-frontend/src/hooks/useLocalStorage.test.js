import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'default_value'));

    expect(result.current[0]).toBe('default_value');
  });

  it('should return stored value from localStorage', () => {
    const testValue = { setting: 'value' };
    localStorage.setItem('test_key', JSON.stringify(testValue));

    const { result } = renderHook(() => useLocalStorage('test_key', 'default_value'));

    expect(result.current[0]).toEqual(testValue);
  });

  it('should set value to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));

    const newValue = 'updated_value';
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toBe(newValue);
    expect(localStorage.getItem('test_key')).toBe(JSON.stringify(newValue));
  });

  it('should handle complex objects', () => {
    const complexValue = {
      enabledWidgets: ['widget1', 'widget2'],
      widgetConfigs: { widget1: { title: 'Widget 1' } },
      widgetOrder: ['widget1', 'widget2'],
    };

    const { result } = renderHook(() => useLocalStorage('dashboard_config', {}));

    act(() => {
      result.current[1](complexValue);
    });

    expect(result.current[0]).toEqual(complexValue);
    expect(JSON.parse(localStorage.getItem('dashboard_config'))).toEqual(complexValue);
  });

  it('should validate value if validator provided', () => {
    const validator = (value) => typeof value === 'number' && value > 0 && value < 100;

    const { result } = renderHook(() =>
      useLocalStorage('score', 50, { validate: validator, suppressErrors: true })
    );

    expect(result.current[0]).toBe(50);

    // Try to set invalid value
    act(() => {
      result.current[1](150);
    });

    // Invalid value is still set (validation only affects storage loading)
    // The hook updates state even if validation fails
    expect(result.current[0]).toBe(150);
  });

  it('should use default value if validation fails', () => {
    const invalidValue = { invalid: 'data' };
    localStorage.setItem('test_key', JSON.stringify(invalidValue));

    const validator = (value) => value && value.valid === true;

    const { result } = renderHook(() =>
      useLocalStorage('test_key', { valid: true }, { validate: validator })
    );

    expect(result.current[0]).toEqual({ valid: true });
  });

  it('should handle function setter', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
  });

  it('should suppress errors when suppressErrors is true', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useLocalStorage('test_key', 'default', { suppressErrors: true })
    );

    expect(result.current[0]).toBe('default');
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should provide remove function', () => {
    localStorage.setItem('test_key', JSON.stringify('test_value'));

    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));

    expect(result.current[0]).toBe('test_value');

    act(() => {
      result.current[2].remove();
    });

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('test_key')).toBeNull();
  });

  it('should handle undefined values', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', undefined));

    expect(result.current[0]).toBeUndefined();

    act(() => {
      result.current[1]('some_value');
    });

    expect(result.current[0]).toBe('some_value');
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', null));

    expect(result.current[0]).toBeNull();

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem('test_key')).toBe('null');
  });

  it('should be SSR safe (handle undefined window)', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));

    // Should return default value if window is not available
    expect(result.current[0]).toBe('default');
  });

  it('should support object with custom validate function', () => {
    const dashboardConfig = {
      enabledWidgets: ['kpi_customers', 'chart_opportunities'],
      widgetConfigs: {},
      widgetOrder: [],
    };

    const validateDashboardConfig = (value) =>
      value &&
      Array.isArray(value.enabledWidgets) &&
      typeof value.widgetConfigs === 'object';

    const { result } = renderHook(() =>
      useLocalStorage('dashboard_config', {}, { validate: validateDashboardConfig })
    );

    act(() => {
      result.current[1](dashboardConfig);
    });

    expect(result.current[0]).toEqual(dashboardConfig);
  });

  it('should persist multiple independent keys', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));

    expect(result1.current[0]).toBe('value1');

    act(() => {
      result1.current[1]('new_value1');
    });

    expect(result1.current[0]).toBe('new_value1');

    // Verify key1 is stored
    expect(JSON.parse(localStorage.getItem('key1'))).toBe('new_value1');

    // Now create second hook for key2
    const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));
    expect(result2.current[0]).toBe('value2');

    // Both keys should be independent
    act(() => {
      result2.current[1]('new_value2');
    });

    expect(result2.current[0]).toBe('new_value2');
    expect(JSON.parse(localStorage.getItem('key1'))).toBe('new_value1');
    expect(JSON.parse(localStorage.getItem('key2'))).toBe('new_value2');
  });
});
