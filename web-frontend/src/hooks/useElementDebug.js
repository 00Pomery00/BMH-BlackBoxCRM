import { useSyncExternalStore } from 'react';

function getSnapshot() {
  return {
    showIds: localStorage.getItem('bbx_showIds') === '1',
    showCategories: localStorage.getItem('bbx_showCategories') === '1',
  };
}

function subscribe(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useElementDebug() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useElementDebug;
