import React from 'react';
import DataTable from '../ui/DataTable';
import { useWidgetRegistry } from '../../hooks/useWidgetRegistry';

function TableSalesAnalyticsWidget({ config }) {
  const { getDemoData } = useWidgetRegistry();
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Sales Analytics'}</h3>
      <DataTable
        data={getDemoData('table_sales_analytics')}
        columns={['name', 'type', 'status', 'priority']}
        columnLabels={{
          name: 'Name',
          type: 'Type',
          status: 'Status',
          priority: 'Priority',
        }}
      />
    </div>
  );
}

export default React.memo(TableSalesAnalyticsWidget);
