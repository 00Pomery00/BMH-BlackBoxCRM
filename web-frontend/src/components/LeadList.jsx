import React, { useState } from 'react';
import LeadDetail from './LeadDetail';
import { useTranslation } from 'react-i18next';

export default function LeadList({ companies = [] }) {
  const [selected, setSelected] = useState(null);
  const { t } = useTranslation();

  if (!companies.length) {
    return <div className="p-4 bg-white rounded border">{t('no_leads')}</div>;
  }

  return (
    <div>
      <div className="space-y-2">
        {companies.map((c) => (
          <div
            key={c.id}
            className="p-3 bg-white rounded border flex justify-between items-center hover:shadow-sm"
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">
                {t('score_label', { value: c.lead_score })}
              </div>
            </div>
            <div>
              <button
                onClick={() => setSelected(c)}
                className="px-3 py-1 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                aria-label={t('open')}
              >
                {t('open')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <LeadDetail lead={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
