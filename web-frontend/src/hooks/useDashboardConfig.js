// web-frontend/src/hooks/useDashboardConfig.js
/**
 * Dashboard Configuration Hook - Unified read/write access to user's dashboard config
 * @module useDashboardConfig
 */

import { useLocalStorage } from './useLocalStorage';

/**
 * @typedef {Object} DashboardConfig
 * @property {string[]} enabledWidgets - List of enabled widget IDs
 * @property {Object.<string, Object>} widgetConfigs - Per-widget configuration
 * @property {string[]} widgetOrder - Order of widgets for display
 */

const DEFAULT_CONFIG = {
  enabledWidgets: ['kpi_customers', 'kpi_revenue', 'kpi_invoices', 'kpi_profit'],
  widgetConfigs: {},
  widgetOrder: [],
};

const UI_SETTINGS_KEY = 'bbx_ui_settings';

/**
 * Validates dashboard configuration structure
 *
 * @param {any} config - Config to validate
 * @returns {boolean} True if valid
 */
function validateDashboardConfig(config) {
  if (!config || typeof config !== 'object') return false;
  if (!Array.isArray(config.enabledWidgets)) return false;
  if (typeof config.widgetConfigs !== 'object') return false;
  if (!Array.isArray(config.widgetOrder)) return false;
  return true;
}

/**
 * Hook for dashboard configuration management
 *
 * Provides unified access to dashboard config from localStorage.
 * Handles read/write with validation and error recovery.
 *
 * @returns {Object} Dashboard config interface
 * @returns {DashboardConfig} .config - Current config
 * @returns {Function} .setConfig - Update entire config
 * @returns {Function} .updateWidgetConfigs - Update widget configs partial
 * @returns {Function} .setEnabledWidgets - Update enabled widgets list
 * @returns {Function} .setWidgetOrder - Update widget order
 * @returns {Function} .reset - Reset to default config
 * @returns {Object} .meta - Metadata
 * @returns {boolean} .meta.isValid - Whether config is valid
 * @returns {string|null} .meta.error - Error message if any
 *
 * @example
 * const { config, setConfig, setEnabledWidgets } = useDashboardConfig();
 *
 * // Enable widget
 * setEnabledWidgets([...config.enabledWidgets, 'widget_new']);
 *
 * // Update specific widget config
 * updateWidgetConfigs({
 *   'kpi_customers': { title: 'My Customers' }
 * });
 */
export function useDashboardConfig() {
  const [uiSettings, setUiSettings] = useLocalStorage(
    UI_SETTINGS_KEY,
    { dashboardConfig: DEFAULT_CONFIG },
    { validate: (v) => v && v.dashboardConfig && validateDashboardConfig(v.dashboardConfig) }
  );

  const dashboardConfig = uiSettings?.dashboardConfig || DEFAULT_CONFIG;
  const isValid = validateDashboardConfig(dashboardConfig);

  /**
   * Update entire dashboard config
   * @param {DashboardConfig} newConfig - New config to set
   */
  const setConfig = (newConfig) => {
    if (!validateDashboardConfig(newConfig)) {
      console.warn('[useDashboardConfig] Invalid config structure, ignoring update');
      return;
    }
    setUiSettings({
      ...uiSettings,
      dashboardConfig: newConfig,
    });
  };

  /**
   * Partially update widget configurations
   * @param {Object.<string, Object>} updates - Partial widget config updates
   */
  const updateWidgetConfigs = (updates) => {
    setUiSettings({
      ...uiSettings,
      dashboardConfig: {
        ...dashboardConfig,
        widgetConfigs: {
          ...dashboardConfig.widgetConfigs,
          ...updates,
        },
      },
    });
  };

  /**
   * Set enabled widgets list
   * @param {string[]} widgetIds - List of widget IDs to enable
   */
  const setEnabledWidgets = (widgetIds) => {
    setUiSettings({
      ...uiSettings,
      dashboardConfig: {
        ...dashboardConfig,
        enabledWidgets: widgetIds,
      },
    });
  };

  /**
   * Set widget display order
   * @param {string[]} order - Widget IDs in desired order
   */
  const setWidgetOrder = (order) => {
    setUiSettings({
      ...uiSettings,
      dashboardConfig: {
        ...dashboardConfig,
        widgetOrder: order,
      },
    });
  };

  /**
   * Reset to default configuration
   */
  const reset = () => {
    setUiSettings({
      ...uiSettings,
      dashboardConfig: DEFAULT_CONFIG,
    });
  };

  return {
    config: dashboardConfig,
    setConfig,
    updateWidgetConfigs,
    setEnabledWidgets,
    setWidgetOrder,
    reset,
    meta: {
      isValid,
      defaultConfig: DEFAULT_CONFIG,
    },
  };
}

export default useDashboardConfig;
