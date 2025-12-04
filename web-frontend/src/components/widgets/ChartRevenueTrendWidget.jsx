import React from 'react';
import AreaChart from '../ui/AreaChart';
import { useWidgetRegistry } from '../../hooks/useWidgetRegistry';

export default function ChartRevenueTrendWidget({ config }) {
  const { getDemoData } = useWidgetRegistry();
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Revenue Trend'}</h3>
      <AreaChart data={getDemoData('chart_revenue_trend')} height={config.height || 300} />
    </div>
  );
}
