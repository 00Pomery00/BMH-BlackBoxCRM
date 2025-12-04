import React from 'react';

export default function TableOpportunitiesWidget({ config }) {
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Opportunities'}</h3>
      <div className="text-gray-500 text-sm p-4">(Demo data - připojit k API)</div>
    </div>
  );
}
