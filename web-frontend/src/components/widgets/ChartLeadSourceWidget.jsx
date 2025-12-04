import React from 'react';
import PieChart from '../ui/PieChart';
import { useWidgetRegistry } from '../../hooks/useWidgetRegistry';

function ChartLeadSourceWidget({ config }) {
  const { getDemoData } = useWidgetRegistry();
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Lead Source'}</h3>
      <PieChart data={getDemoData('chart_lead_source')} height={config.height || 300} />
    </div>
  );
}

export default React.memo(ChartLeadSourceWidget);
