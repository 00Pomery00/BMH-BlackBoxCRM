import fetch from 'cross-fetch'

const BASE = process.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchCompanies() {
  const res = await fetch(`${BASE}/companies`)
  if (!res.ok) throw new Error('Failed to fetch companies')
  const data = await res.json()
  return data.companies || []
}

export async function fetchGamification() {
  const res = await fetch(`${BASE}/gamification`)
  if (!res.ok) return {}
  return await res.json()
}
