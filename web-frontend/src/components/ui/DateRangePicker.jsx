import React from 'react'

export default function DateRangePicker({ from, to, onChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      <input
        className="rounded border border-gray-300 px-2 py-1 text-sm"
        type="date"
        value={from || ''}
        onChange={e => onChange && onChange({ from: e.target.value, to })}
      />
      <span className="text-gray-500">—</span>
      <input
        className="rounded border border-gray-300 px-2 py-1 text-sm"
        type="date"
        value={to || ''}
        onChange={e => onChange && onChange({ from, to: e.target.value })}
      />
    </div>
  )
}
