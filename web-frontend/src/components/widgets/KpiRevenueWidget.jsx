import React from 'react';
import KpiCard from '../ui/KpiCard';

function KpiRevenueWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Revenue'}
      value={config.value || '$5,125'}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}

export default React.memo(KpiRevenueWidget);
