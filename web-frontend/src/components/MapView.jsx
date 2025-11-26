import React from 'react';

export default function MapView({ companies = [] }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Map (demo)</h2>
      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
        <div className="text-gray-500">
          Map visualization placeholder — {companies.length} leads
        </div>
      </div>
    </section>
  );
}
