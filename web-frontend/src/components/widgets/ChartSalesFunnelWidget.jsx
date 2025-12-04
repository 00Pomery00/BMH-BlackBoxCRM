import React from 'react';
import BarChart from '../ui/BarChart';
import { useWidgetRegistry } from '../../hooks/useWidgetRegistry';

function ChartSalesFunnelWidget({ config }) {
  const { getDemoData } = useWidgetRegistry();
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Sales Funnel'}</h3>
      <BarChart data={getDemoData('chart_sales_funnel')} height={config.height || 300} />
    </div>
  );
}

export default React.memo(ChartSalesFunnelWidget);
