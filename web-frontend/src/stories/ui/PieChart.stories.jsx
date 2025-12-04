import React from 'react';
import SimplePieChart from '../../components/ui/PieChart';

export default { title: 'UI/PieChart' };

const data = [
  { name: 'A', value: 400 },
  { name: 'B', value: 300 },
  { name: 'C', value: 300 },
  { name: 'D', value: 200 },
];

export const Default = () => (
  <div style={{ width: 360 }}>
    <SimplePieChart data={data} />
  </div>
);
