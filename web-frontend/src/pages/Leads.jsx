
import React from 'react';
import { useTranslation } from 'react-i18next';
import LeadList from '../components/LeadList';
import useElementDebug from '../hooks/useElementDebug';

export default function Leads({ companies = [] }) {
  const { t } = useTranslation();
  const { showIds, showCategories } = useElementDebug();
  return (
    <section className="max-w-4xl mx-auto bg-white p-6 rounded shadow" data-id="leads-section" data-category="panel">
      <h2 className="text-xl font-semibold mb-4" data-id="leads-title" data-category="nadpis">{t('leads')}</h2>
      <div data-id="leads-list" data-category="tabulka" style={{position:'relative'}}>
        <LeadList companies={companies} />
        {showIds && <span style={{position:'absolute',top:4,right:8,fontSize:10,background:'#eee',padding:'0 4px',borderRadius:3}}>leads-list</span>}
        {showCategories && <span style={{position:'absolute',top:20,right:8,fontSize:10,background:'#e0e7ff',padding:'0 4px',borderRadius:3}}>tabulka</span>}
      </div>
    </section>
  );
}
