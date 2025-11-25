import React from 'react'

export default function LeadList({ companies = [] }) {
  if (!companies.length) {
    return <div className="p-4 bg-white rounded border">No leads yet.</div>
  }

  return (
    <div className="space-y-2">
      {companies.map((c) => (
        <div key={c.id} className="p-3 bg-white rounded border flex justify-between items-center">
          <div>
            <div className="font-semibold">{c.name}</div>
            <div className="text-sm text-gray-600">Score: {c.lead_score}</div>
          </div>
          <div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Open</button>
          </div>
        </div>
      ))}
    </div>
  )
}
