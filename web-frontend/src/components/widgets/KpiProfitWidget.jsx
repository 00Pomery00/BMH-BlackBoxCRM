import React from 'react';
import KpiCard from '../ui/KpiCard';

export default function KpiProfitWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Profit'}
      value={config.value || '70%'}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}
