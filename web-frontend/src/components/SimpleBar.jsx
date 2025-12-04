import React from 'react';

export default function SimpleBar({ value = 0, max = 100, label = '', color = 'bg-violet-600' }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
        <div className={`${color} h-3 rounded`} style={{ width: percent + '%' }} />
      </div>
    </div>
  );
}
