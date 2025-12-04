import React from 'react';
import KpiCard from '../ui/KpiCard';

/**
 * Widget: KPI Customers (memoized for performance)
 * @param {object} props
 * @param {object} props.config
 */
function KpiCustomersWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Customers'}
      value={config.value || 4562}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}

export default React.memo(KpiCustomersWidget);
