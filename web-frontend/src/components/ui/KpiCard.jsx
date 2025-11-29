import React from 'react';

export default function KpiCard({ title, value, delta, testId }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border transform transition hover:shadow-md hover:-translate-y-0.5">
      <div className="text-sm text-gray-500" data-testid={testId || `kpi-${String(title).replace(/\s+/g, '-').toLowerCase()}`}>
        {title}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {delta !== undefined && (
        <div className="text-sm text-green-600 mt-1">{delta >= 0 ? `+${delta}%` : `${delta}%`}</div>
      )}
    </div>
  );
}
