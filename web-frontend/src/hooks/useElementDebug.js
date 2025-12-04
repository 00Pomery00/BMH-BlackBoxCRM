import { useSyncExternalStore } from 'react';

// Keep a cached snapshot object so that the selector returns the same
// reference when values haven't changed. React components relying on the
// object identity won't re-render in a loop.
function createGetSnapshot() {
  let last = { showIds: false, showCategories: false };
  return function getSnapshot() {
    const showIds = localStorage.getItem('bbx_showIds') === '1';
    const showCategories = localStorage.getItem('bbx_showCategories') === '1';
    if (last.showIds === showIds && last.showCategories === showCategories) {
      return last;
    }
    last = { showIds, showCategories };
    return last;
  };
}

const getSnapshot = createGetSnapshot();

function subscribe(callback) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function useElementDebug() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useElementDebug;
