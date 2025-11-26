import fetch from 'cross-fetch';

const BASE = process.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchCompanies() {
  const res = await fetch(`${BASE}/companies`);
  if (!res.ok) throw new Error('Failed to fetch companies');
  const data = await res.json();
  return data.companies || [];
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
