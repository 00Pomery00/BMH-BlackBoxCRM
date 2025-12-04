import fetch from 'cross-fetch';

// Allow runtime override via `window.__BACKEND_URL` or `window.BBX_API_URL` so
// E2E tests can point the static `file://` build at a mock backend without
// rebuilding the app.
const RUNTIME_BASE =
  (typeof window !== 'undefined' && (window.__BACKEND_URL || window.BBX_API_URL)) || null;
// Pro vývoj s Vite proxy používejme prázdný string (relativní cesta)
const BASE = RUNTIME_BASE || process.env.VITE_API_URL || '';

export async function fetchCompanies() {
  const res = await fetch(`${BASE}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  const data = await res.json();
  // Accept backend responses in two shapes:
  // 1) { companies: [...] } (some APIs)
  // 2) [...] (tests and simple mock backends)
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.companies)) return data.companies;
  // Some backends may return { companies: [...] } nested under a different key
  // or include the array directly under `data` — be defensive and try common shapes.
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function fetchGamification() {
  const res = await fetch(`${BASE}/gamification`);
  if (!res.ok) return {};
  return await res.json();
}

// Automations admin API
export async function listAutomations() {
  const res = await fetch(`${BASE}/admin/automations`);
  if (!res.ok) throw new Error('Failed to fetch automations');
  return await res.json();
}

export async function createAutomation(payload) {
  const res = await fetch(`${BASE}/admin/automations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res;
}

export async function runAutomation(id, payload) {
  const res = await fetch(`${BASE}/admin/automations/${id}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  return res;
}
