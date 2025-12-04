import React from 'react';

export default function TicketList({ tickets = [] }) {
  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Recent Tickets</h3>
      <ul className="space-y-2">
        {tickets.length === 0 && <li className="text-sm text-gray-500">No tickets</li>}
        {tickets.map((t) => (
          <li key={t.id} className="p-2 border rounded hover:shadow">
            <div className="flex justify-between">
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-gray-500">{t.status}</div>
            </div>
            <div className="text-sm text-gray-600">{t.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
