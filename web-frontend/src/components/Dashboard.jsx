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
      <h2 className="text-xl font-semibold mb-4">Přehled</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Firmy" value={total} />
        <KpiCard title="Prům. skóre leadů" value={avg} />
        <KpiCard title="Nejlepší lead" value={top ? top.name : '—'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Leady</h3>
          <LeadList companies={companies} />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Nedávné aktivity</h3>
          <div className="p-4 bg-white rounded border">Zatím žádné aktivity.</div>
        </div>
      </div>
    </section>
  );
}
