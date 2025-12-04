import React from 'react';
import DataTable from '../../components/ui/DataTable';

export default { title: 'UI/DataTable' };

const columns = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Name' },
  { key: 'score', title: 'Score' },
];
const rows = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  name: `Company ${i + 1}`,
  score: Math.round(Math.random() * 100),
}));

export const Default = () => (
  <div style={{ width: 600 }}>
    <DataTable columns={columns} rows={rows} />
  </div>
);
