// web-frontend/src/hooks/useLocalStorage.js
/**
 * Custom hook for safe localStorage access with error handling and validation
 * @module useLocalStorage
 */

import { useState } from 'react';

/**
 * Safe localStorage hook with JSON serialization
 *
 * @template T
 * @param {string} key - localStorage key name
 * @param {T} initialValue - Default value if key not found or invalid
 * @param {Object} [options] - Configuration options
 * @param {Function} [options.validate] - Optional validation function: (value) => boolean
 * @param {boolean} [options.suppressErrors=false] - Suppress console errors
 * @returns {[T, Function, Object]} - [value, setValue, { error, isLoading }]
 *
 * @example
 * const [settings, setSettings] = useLocalStorage('bbx_ui_settings', defaultConfig);
 * const [theme, setTheme] = useLocalStorage('theme', 'light', {
 *   validate: (v) => ['light', 'dark'].includes(v)
 * });
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { validate, suppressErrors = false } = options;

  // State to store our value and error state
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Check if window/localStorage available (SSR check)
      if (typeof window === 'undefined') {
        return initialValue;
      }

      // Get from localStorage
      const item = window.localStorage.getItem(key);

      // Parse item if exists
      if (item) {
        const parsed = JSON.parse(item);

        // Validate if validator provided
        if (validate && !validate(parsed)) {
          if (!suppressErrors) console.warn(`[useLocalStorage] Validation failed for key: ${key}`);
          return initialValue;
        }

        return parsed;
      }

      return initialValue;
    } catch (error) {
      if (!suppressErrors) console.error(`[useLocalStorage] Error reading ${key}:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Validate before storing
      if (validate && !validate(valueToStore)) {
        throw new Error(`Validation failed for key: ${key}`);
      }

      // Check if window available (SSR safe)
      if (typeof window === 'undefined') {
        setStoredValue(valueToStore);
        return;
      }

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      if (!suppressErrors) console.error(`[useLocalStorage] Error setting ${key}:`, error);
      // Still update state even if storage fails
      setStoredValue(value instanceof Function ? value(storedValue) : value);
    }
  };

  // Remove from localStorage
  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      if (!suppressErrors) console.error(`[useLocalStorage] Error removing ${key}:`, error);
    }
  };

  return [storedValue, setValue, { remove: removeValue }];
}

export default useLocalStorage;
