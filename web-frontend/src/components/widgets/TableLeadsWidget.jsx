import React from 'react';
import DataTable from '../ui/DataTable';

export default function TableLeadsWidget({ config, companies }) {
  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <h3 className="text-lg font-medium mb-4">{config.title || 'Active Leads'}</h3>
      <DataTable
        data={companies.slice(0, config.pageSize || 10)}
        columns={['name', 'email', 'lead_score']}
        columnLabels={{
          name: 'Jméno',
          email: 'Email',
          lead_score: 'Skóre',
        }}
      />
    </div>
  );
}
