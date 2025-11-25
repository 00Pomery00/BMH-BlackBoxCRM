const STORAGE_FILE = './offline_leads.json'

let _cache = []

export function getOfflineLeads() {
  // In a real app use AsyncStorage or filesystem. Here keep in-memory for demo.
  return _cache.slice()
}

export function addOfflineLead(lead) {
  // Deduplicate by email if present
  if (lead.email) {
    const exists = _cache.find((l) => l.email === lead.email)
    if (exists) return
  }
  _cache.push(lead)
}

export function clearOfflineLeads() {
  _cache = []
}
