import React from 'react';
import KpiCard from './ui/KpiCard';
import LeadList from './LeadList';

export default function Dashboard({ companies = [] }) {
  const total = companies.length;
  const avg = total
    ? (companies.reduce((s, c) => s + (c.lead_score || 0), 0) / total).toFixed(1)
    : 0;
  const top = companies.slice().sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))[0];

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Companies" value={total} />
        <KpiCard title="Avg Lead Score" value={avg} />
        <KpiCard title="Top Lead" value={top ? top.name : '—'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Leads</h3>
          <LeadList companies={companies} />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
          <div className="p-4 bg-white rounded border">No recent activity.</div>
        </div>
      </div>
    </section>
  );
}
