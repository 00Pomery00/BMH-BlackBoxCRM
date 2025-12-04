import React from 'react';
import AdvancedDataGrid from '../../components/ui/AdvancedDataGrid';

export default { title: 'UI/AdvancedDataGrid' };

const fakeFetch = (page, pageSize) => {
  const total = 42;
  const items = Array.from({ length: pageSize }, (_, i) => ({
    id: (page - 1) * pageSize + i + 1,
    name: `Item ${(page - 1) * pageSize + i + 1}`,
  }));
  return Promise.resolve({ items, total });
};

export const Default = () => (
  <div style={{ width: 800 }}>
    <AdvancedDataGrid fetchPage={fakeFetch} />
  </div>
);
