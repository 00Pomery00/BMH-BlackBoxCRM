import React from 'react';
import { useTranslation } from 'react-i18next';
import KpiCard from './ui/KpiCard';
import LeadList from './LeadList';

export default function Dashboard({ companies = [] }) {
  const { t } = useTranslation();
  const total = companies.length;
  const avg = total
    ? (companies.reduce((s, c) => s + (c.lead_score || 0), 0) / total).toFixed(1)
    : 0;
  const top = companies.slice().sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))[0];

  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-4">{t('overview')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <KpiCard title={t('companies')} value={total} />
        <KpiCard title={t('avg_lead_score')} value={avg} />
        <KpiCard title={t('top_lead')} value={top ? top.name : '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 data-testid="dashboard-leads-heading" className="text-lg font-medium">
              {t('leads')}
            </h3>
            <div className="text-sm text-gray-500">
              {t('companies')}: {total}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <LeadList companies={companies} />
          </div>
        </div>

        <aside>
          <h3 className="text-lg font-medium mb-2">{t('recent_activity')}</h3>
          <div className="p-4 bg-white rounded border">{t('no_recent_activity')}</div>
        </aside>
      </div>
    </section>
  );
}
