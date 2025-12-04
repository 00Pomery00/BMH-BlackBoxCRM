import React from 'react';
import KpiCard from '../ui/KpiCard';

export default function KpiInvoicesWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Invoices'}
      value={config.value || 2145}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}
