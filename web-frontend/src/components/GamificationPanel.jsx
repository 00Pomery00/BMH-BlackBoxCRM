import React from 'react';
import { useTranslation } from 'react-i18next';

export default function GamificationPanel({ stats = {} }) {
  const { t } = useTranslation();
  return (
    <section className="mb-6 p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-medium mb-2">{t('gamification')}</h2>
      <div className="flex gap-4">
        <div>{t('xp', { value: stats.XP ?? 0 })}</div>
        <div>{t('salescoins', { value: stats.SalesCoins ?? 0 })}</div>
        <div>{t('level', { value: stats.Level ?? 1 })}</div>
      </div>
    </section>
  );
}
