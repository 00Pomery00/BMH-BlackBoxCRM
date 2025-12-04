import React from 'react';

export default function ActivityFeed({ items = [] }) {
  const list = items.length
    ? items
    : [
        { id: 1, text: 'Nový lead: Jan Novák (Acme Corp)', time: '2 min' },
        { id: 2, text: 'Aktualizace: Lead score pro Beta LLC', time: '20 min' },
        { id: 3, text: 'Uživatel Petra přidala komentář', time: '1 h' },
      ];

  return (
    <div className="space-y-3">
      {list.map((it) => (
        <div key={it.id} className="p-3 bg-white rounded border">
          <div className="text-sm text-gray-700">{it.text}</div>
          <div className="text-xs text-gray-400 mt-1">{it.time} ago</div>
        </div>
      ))}
    </div>
  );
}
