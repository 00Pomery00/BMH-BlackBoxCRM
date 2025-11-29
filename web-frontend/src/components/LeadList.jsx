import React, { useState } from 'react';
import LeadDetail from './LeadDetail';
import { useTranslation } from 'react-i18next';

export default function LeadList({ companies = [] }) {
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState(companies);
  const { t } = useTranslation();

  // expose a helper so E2E tests can open a lead programmatically
  React.useEffect(() => {
    setList(companies);
  }, [companies]);

  React.useEffect(() => {
    try {
      window.BBX_OPEN_LEAD = (id) => {
        try {
          const found = (list || []).find((x) => x.id === id || (`lead-item-${x.id}`) === id);
          if (found) {
            console.debug('BBX_OPEN_LEAD found', id);
            try { window.__LAST_SELECTED = found; } catch (e) {}
            setSelected(found);
          }
        } catch (e) { console.error('BBX_OPEN_LEAD error', e); }
      };
    } catch (e) {}
    return () => { try { delete window.BBX_OPEN_LEAD } catch (e) {} };
  }, [list]);

  if (!list.length) {
    return <div className="p-4 bg-white rounded border">{t('no_leads')}</div>;
  }

  return (
    <div data-testid="lead-list-root">
      <div className="space-y-2" data-testid="lead-list">
        {list.map((c) => (
          <div
            key={c.id}
            data-testid={`lead-item-${c.id}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              console.debug('LeadList: item clicked', c && c.id);
              try { window.__LAST_SELECTED = c; } catch(e) {}
              setSelected(c);
            }}
            className="p-3 bg-white rounded border flex justify-between items-center hover:shadow-sm cursor-pointer"
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">
                {t('score_label', { value: c.lead_score })}
              </div>
            </div>
            <div>
              <button
                  onClick={(e) => { e.stopPropagation(); setSelected(c); }}
                data-testid={`lead-open-${c.id}`}
                className="px-3 py-1 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                aria-label={t('open')}
              >
                {t('open')}
              </button>
            </div>
          </div>
        ))}
      </div>
      <LeadDetail
        lead={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => {
          setList((lst) => lst.filter((l) => l.id !== id));
          setSelected(null);
        }}
      />
    </div>
  );
}
