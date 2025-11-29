import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useElementDebug from '../hooks/useElementDebug';
import CompanyDetail from '../components/CompanyDetail';

export default function Companies({ companies = [] }) {
  const { t } = useTranslation();
  const { showIds, showCategories } = useElementDebug();
  const [selected, setSelected] = useState(null);
  const [list, setList] = useState(companies);
  React.useEffect(() => {
    setList(companies);
  }, [companies]);
  return (
    <section
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
      data-id="companies-section"
      data-category="panel"
    >
      <h2 className="text-xl font-semibold mb-4" data-id="companies-title" data-category="nadpis">
        {t('companies')}
      </h2>
      <ul
        className="divide-y"
        data-id="companies-list"
        data-category="tabulka"
        style={{ position: 'relative' }}
      >
        {list.map((c) => (
          <li
            key={c.id}
            className="py-3 flex justify-between items-center hover:bg-violet-50 cursor-pointer"
            data-id={`company-row-${c.id}`}
            data-category="radek"
            onClick={() => setSelected(c)}
          >
            <div>
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-gray-600">
                {t('score_label', { value: c.lead_score })}
              </div>
            </div>
            <span className="text-xs text-gray-400">ID: {c.id}</span>
          </li>
        ))}
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
            companies-list
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
            tabulka
          </span>
        )}
      </ul>
      <CompanyDetail
        company={selected}
        onClose={() => setSelected(null)}
        onDelete={(id) => {
          setList((lst) => lst.filter((l) => l.id !== id));
          setSelected(null);
        }}
      />
    </section>
  );
}
