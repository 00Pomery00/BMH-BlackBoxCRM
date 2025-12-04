import React from 'react';
import SimpleLineChart from '../../components/ui/LineChart';

export default { title: 'UI/LineChart' };

const data = Array.from({ length: 12 }).map((_, i) => ({
  name: `M${i + 1}`,
  value: Math.round(Math.random() * 100),
}));

export const Default = () => (
  <div style={{ width: 360 }}>
    <SimpleLineChart data={data} />
  </div>
);
