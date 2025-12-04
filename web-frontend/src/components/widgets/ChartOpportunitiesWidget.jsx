import React from 'react';
import LineChart from '../ui/LineChart';
import { useWidgetRegistry } from '../../hooks/useWidgetRegistry';

export default function ChartOpportunitiesWidget({ config }) {
  const { getDemoData } = useWidgetRegistry();
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Opportunities'}</h3>
      <LineChart
        data={getDemoData('chart_opportunities')}
        height={config.height || 300}
        dataKey="value"
        xAxisKey="month"
      />
    </div>
  );
}
