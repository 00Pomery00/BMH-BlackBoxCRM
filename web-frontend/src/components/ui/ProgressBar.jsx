import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="w-full">
      <div
        className="w-full bg-gray-200 rounded h-3 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="h-3 bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
      {label ? <div className="text-sm text-gray-600 mt-1">{label}</div> : null}
    </div>
  );
}
