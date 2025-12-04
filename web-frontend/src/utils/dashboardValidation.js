// web-frontend/src/utils/dashboardValidation.js
/**
 * Dashboard Configuration Validation
 * @module dashboardValidation
 */

/**
 * Widget ID validation rules
 * @type {Object.<string, {min: number, max: number, description: string}>}
 */
const CONFIG_RULES = {
  title: {
    minLength: 1,
    maxLength: 100,
    description: 'Widget title (1-100 chars, no HTML)',
  },
  height: {
    min: 200,
    max: 600,
    step: 50,
    description: 'Chart height in pixels (200-600)',
  },
  pageSize: {
    min: 1,
    max: 100,
    description: 'Table rows per page (1-100)',
  },
  itemsLimit: {
    min: 1,
    max: 20,
    description: 'Max items to display (1-20)',
  },
};

/**
 * Validate individual widget configuration value
 *
 * @param {string} configKey - Key to validate (title, height, pageSize, itemsLimit)
 * @param {any} value - Value to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 *
 * @example
 * validateConfigValue('title', 'My Widget');
 * // { valid: true }
 *
 * validateConfigValue('height', 150);
 * // { valid: false, error: 'height must be between 200-600' }
 */
export function validateConfigValue(configKey, value) {
  const rule = CONFIG_RULES[configKey];

  if (!rule) {
    return { valid: true }; // Unknown config key, allow it (forward compatibility)
  }

  // String validation (title)
  if (configKey === 'title') {
    if (typeof value !== 'string') {
      return { valid: false, error: `${configKey} must be a string` };
    }
    if (value.length < rule.minLength || value.length > rule.maxLength) {
      return {
        valid: false,
        error: `${configKey} must be ${rule.minLength}-${rule.maxLength} characters`,
      };
    }
    // Prevent script injection
    if (/<[^>]*>/g.test(value)) {
      return { valid: false, error: `${configKey} cannot contain HTML` };
    }
    return { valid: true };
  }

  // Number validation (height, pageSize, itemsLimit)
  if (typeof value !== 'number') {
    return { valid: false, error: `${configKey} must be a number` };
  }
  if (value < rule.min || value > rule.max) {
    return {
      valid: false,
      error: `${configKey} must be between ${rule.min}-${rule.max}`,
    };
  }
  if (rule.step && value % rule.step !== 0) {
    return {
      valid: false,
      error: `${configKey} must be multiple of ${rule.step}`,
    };
  }

  return { valid: true };
}

/**
 * Validate complete widget configuration object
 *
 * @param {Object} config - Widget config to validate
 * @returns {{valid: boolean, errors?: string[]}} Validation result
 *
 * @example
 * validateWidgetConfig({
 *   title: 'My Chart',
 *   height: 300,
 *   pageSize: 10
 * });
 * // { valid: true }
 */
export function validateWidgetConfig(config) {
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'] };
  }

  const errors = [];

  Object.entries(config).forEach(([key, value]) => {
    const result = validateConfigValue(key, value);
    if (!result.valid) {
      errors.push(result.error);
    }
  });

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Sanitize widget config by removing invalid entries
 *
 * @param {Object} config - Config to sanitize
 * @param {Object} defaults - Default values to use for invalid entries
 * @returns {Object} Sanitized config
 *
 * @example
 * const safeConfig = sanitizeWidgetConfig(
 *   { title: '<script>alert("xss")</script>', height: 150 },
 *   { title: 'Widget', height: 300 }
 * );
 * // { title: 'Widget', height: 300 }
 */
export function sanitizeWidgetConfig(config, defaults = {}) {
  if (!config || typeof config !== 'object') {
    return defaults;
  }

  const sanitized = {};

  Object.entries(config).forEach(([key, value]) => {
    const result = validateConfigValue(key, value);
    if (result.valid) {
      sanitized[key] = value;
    } else if (defaults[key] !== undefined) {
      sanitized[key] = defaults[key];
    }
    // Otherwise skip invalid key
  });

  return sanitized;
}

/**
 * Get validation rule for config key
 *
 * @param {string} configKey - Key to get rules for
 * @returns {Object|null} Validation rule or null if not found
 */
export function getConfigRule(configKey) {
  return CONFIG_RULES[configKey] || null;
}

/**
 * Get all validation rules
 *
 * @returns {Object} All config rules
 */
export function getAllConfigRules() {
  return { ...CONFIG_RULES };
}

export default {
  validateConfigValue,
  validateWidgetConfig,
  sanitizeWidgetConfig,
  getConfigRule,
  getAllConfigRules,
  CONFIG_RULES,
};
