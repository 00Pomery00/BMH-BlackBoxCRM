import React from 'react';
import { useTranslation } from 'react-i18next';

export default function MapView({ companies = [] }) {
  const { t } = useTranslation();
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-2">{t('map_demo')}</h2>
      <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
        <div className="text-gray-500">{t('map_placeholder', { count: companies.length })}</div>
      </div>
    </section>
  );
}
