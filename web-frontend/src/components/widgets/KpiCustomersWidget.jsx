import React from 'react';
import KpiCard from '../ui/KpiCard';

/**
 * Widget: KPI Customers
 * @param {object} props
 * @param {object} props.config
 */
export default function KpiCustomersWidget({ config }) {
  return (
    <KpiCard
      title={config.title || 'Customers'}
      value={config.value || 4562}
      trend={config.trend}
      trendUp={config.trendUp}
    />
  );
}
