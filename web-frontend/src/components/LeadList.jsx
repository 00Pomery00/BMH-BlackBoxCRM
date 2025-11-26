import React, { useState } from 'react';
import LeadDetail from './LeadDetail';

export default function LeadList({ companies = [] }) {
  const [selected, setSelected] = useState(null);

  if (!companies.length) {
    return <div className="p-4 bg-white rounded border">Zatím žádné leady.</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        {companies.map((c) => (
          <div key={c.id} className="p-3 bg-white rounded border flex justify-between items-center">
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">Skóre: {c.lead_score}</div>
            </div>
            <div>
              <button
                onClick={() => setSelected(c)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Otevřít
              </button>
            </div>
          </div>
        ))}
      </div>

      <LeadDetail lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
