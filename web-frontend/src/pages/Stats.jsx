

import React from 'react';
import { useTranslation } from 'react-i18next';
import useElementDebug from '../hooks/useElementDebug';
import SimpleBar from '../components/SimpleBar';

export default function Stats() {
  const { t } = useTranslation();
  const { showIds, showCategories } = useElementDebug();
  // Demo data
  const stats = {
    totalLeads: 42,
    wonLeads: 18,
    lostLeads: 7,
    totalCompanies: 12,
    commission: 125000,
    commissionGoal: 200000,
  };
  return (
    <section className="max-w-4xl mx-auto bg-white p-6 rounded shadow" data-id="stats-section" data-category="panel">
      <h2 className="text-xl font-semibold mb-4" data-id="stats-title" data-category="nadpis">{t('statistics')}</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded p-4 shadow-sm">
          <div className="font-semibold mb-2">{t('leads')}</div>
          <div className="mb-2 text-2xl font-bold">{stats.totalLeads}</div>
          <SimpleBar value={stats.wonLeads} max={stats.totalLeads} label={t('won_leads', 'Vyhrané leady')} color="bg-green-500" />
          <SimpleBar value={stats.lostLeads} max={stats.totalLeads} label={t('lost_leads', 'Ztracené leady')} color="bg-red-400" />
        </div>
        <div className="bg-gray-50 rounded p-4 shadow-sm">
          <div className="font-semibold mb-2">{t('commission', 'Provize')}</div>
          <div className="mb-2 text-2xl font-bold">{stats.commission.toLocaleString('cs-CZ')} Kč</div>
          <SimpleBar value={stats.commission} max={stats.commissionGoal} label={t('commission_goal', 'Cíl provizí')} color="bg-violet-600" />
        </div>
      </div>
      <div className="text-gray-500" data-id="stats-placeholder" data-category="panel" style={{position:'relative'}}>
        {t('stats_placeholder', 'Statistiky budou brzy rozšířeny o další grafy a přehledy.')}
        {showIds && <span style={{position:'absolute',top:4,right:8,fontSize:10,background:'#eee',padding:'0 4px',borderRadius:3}}>stats-placeholder</span>}
        {showCategories && <span style={{position:'absolute',top:20,right:8,fontSize:10,background:'#e0e7ff',padding:'0 4px',borderRadius:3}}>panel</span>}
      </div>
    </section>
  );
}
