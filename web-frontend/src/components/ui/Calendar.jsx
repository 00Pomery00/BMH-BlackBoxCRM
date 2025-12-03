import React, { useState } from 'react';

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date) {
  const start = startOfMonth(date);
  const next = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  const diff = (next - start) / (1000 * 60 * 60 * 24);
  return diff;
}

export default function Calendar({ events = [] }) {
  const [cursor, setCursor] = useState(startOfMonth(new Date()));

  const month = cursor.getMonth();
  const year = cursor.getFullYear();
  const total = daysInMonth(cursor);

  const firstDay = startOfMonth(cursor).getDay(); // 0..6 (Sun..Sat)

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));

  const gotoPrev = () => setCursor(new Date(year, month - 1, 1));
  const gotoNext = () => setCursor(new Date(year, month + 1, 1));

  const fmt = (d) => d.toLocaleDateString();

  return (
    <div className="p-4 bg-white rounded shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">
          {cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <div className="space-x-2">
          <button className="btn-primary px-3 py-1" onClick={gotoPrev}>
            Prev
          </button>
          <button className="btn-primary px-3 py-1" onClick={gotoNext}>
            Next
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-xs text-gray-500 text-center">
            {d}
          </div>
        ))}
        {cells.map((dt, i) => (
          <div key={i} className={`h-20 p-1 border rounded-sm ${dt ? '' : 'bg-gray-50'}`}>
            {dt && (
              <div>
                <div className="text-sm font-medium">{dt.getDate()}</div>
                <div className="mt-1 text-xs text-gray-600">
                  {events
                    .filter((e) => e.date === fmt(dt))
                    .slice(0, 2)
                    .map((e, idx) => (
                      <div key={idx} className="truncate">
                        • {e.title}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
