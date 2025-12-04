import React from 'react';
import KpiCard from '../ui/KpiCard';

function KpiProfitWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Profit'}
      value={config.value || '70%'}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}

export default React.memo(KpiProfitWidget);
