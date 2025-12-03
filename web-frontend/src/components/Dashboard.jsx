import React from 'react';
import { useTranslation } from 'react-i18next';
import KpiCard from './ui/KpiCard';
import SimpleBarChart from './ui/BarChart';
import ActivityFeed from './ActivityFeed';
import LeadList from './LeadList';
import useElementDebug from '../hooks/useElementDebug';

export default function Dashboard({ companies = [] }) {
  const { t } = useTranslation();
  const total = companies.length;
  const avg = total
    ? (companies.reduce((s, c) => s + (c.lead_score || 0), 0) / total).toFixed(1)
    : 0;
  const top = companies.slice().sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))[0];

  // Zobrazení ID/kategorií podle nastavení uživatele (centralizovaně)
  const { showIds, showCategories } = useElementDebug();

  // Drag & drop pořadí karet (uloženo v localStorage)
  const defaultOrder = ['companies', 'avg_lead_score', 'top_lead'];
  const [order, setOrder] = React.useState(() => {
    const saved = localStorage.getItem('bbx_dashboardOrder');
    return saved ? JSON.parse(saved) : defaultOrder;
  });

  function onDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id);
  }
  function onDrop(e, id) {
    const dragged = e.dataTransfer.getData('text/plain');
    if (!dragged || dragged === id) return;
    const idx = order.indexOf(dragged);
    const targetIdx = order.indexOf(id);
    if (idx === -1 || targetIdx === -1) return;
    const newOrder = [...order];
    newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, dragged);
    setOrder(newOrder);
    localStorage.setItem('bbx_dashboardOrder', JSON.stringify(newOrder));
  }

  const kpiMap = {
    companies: {
      title: t('companies'),
      value: total,
      id: 'dashboard-kpi-companies',
      category: 'karta',
    },
    avg_lead_score: {
      title: t('avg_lead_score'),
      value: avg,
      id: 'dashboard-kpi-avg',
      category: 'karta',
    },
    top_lead: {
      title: t('top_lead'),
      value: top ? top.name : '—',
      id: 'dashboard-kpi-top',
      category: 'karta',
    },
  };

  // Sample sparkline data for KPI cards
  const sampleSpark = [{ value: 10 }, { value: 30 }, { value: 20 }, { value: 50 }, { value: 40 }];

  const salesData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 50 },
    { name: 'Thu', value: 70 },
    { name: 'Fri', value: 60 },
  ];

  return (
    <section className="mb-6" data-id="dashboard-section" data-category="panel">
      <h2 className="text-xl font-semibold mb-4" data-id="dashboard-title" data-category="nadpis">
        {t('overview')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {order.map((key) => {
          const kpi = kpiMap[key];
          return (
            <div
              key={kpi.id}
              data-id={kpi.id}
              data-category={kpi.category}
              draggable
              onDragStart={(e) => onDragStart(e, key)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, key)}
              className="cursor-move"
              style={{ position: 'relative' }}
            >
              <KpiCard title={kpi.title} value={kpi.value} sparkline={sampleSpark} />
              {showIds && (
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 8,
                    fontSize: 10,
                    background: '#eee',
                    padding: '0 4px',
                    borderRadius: 3,
                  }}
                >
                  {kpi.id}
                </span>
              )}
              {showCategories && (
                <span
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 8,
                    fontSize: 10,
                    background: '#e0e7ff',
                    padding: '0 4px',
                    borderRadius: 3,
                  }}
                >
                  {kpi.category}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" data-id="dashboard-leads-panel" data-category="panel">
          <div className="mb-3 flex items-center justify-between">
            <h3
              data-testid="dashboard-leads-heading"
              className="text-lg font-medium"
              data-id="dashboard-leads-title"
              data-category="nadpis"
            >
              {t('leads')}
            </h3>
            <div className="text-sm text-gray-500">
              {t('companies')}: {total}
            </div>
          </div>
          <div
            className="bg-gray-50 p-4 rounded"
            data-id="dashboard-leads-list"
            data-category="tabulka"
          >
            <LeadList companies={companies} />
          </div>
        </div>

        <aside data-id="dashboard-activity-panel" data-category="panel">
          <h3
            className="text-lg font-medium mb-2"
            data-id="dashboard-activity-title"
            data-category="nadpis"
          >
            {t('recent_activity')}
          </h3>
          <div
            className="p-4 bg-white rounded border"
            data-id="dashboard-activity-list"
            data-category="tabulka"
          >
            <SimpleBarChart data={salesData} />
            <div className="mt-4">
              <ActivityFeed />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
