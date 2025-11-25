import React from 'react'

export default function FilterChip({ label, onRemove, active = false }) {
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
      <span className="truncate">{label}</span>
      {onRemove ? (
        <button className="ml-1 text-gray-500 hover:text-gray-800" onClick={onRemove} aria-label={`Remove ${label}`}>✕</button>
      ) : null}
    </div>
  )
}
