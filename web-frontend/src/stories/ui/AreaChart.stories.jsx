import React from 'react';
import SimpleAreaChart from '../../components/ui/AreaChart';

export default { title: 'UI/AreaChart' };

const data = Array.from({ length: 12 }).map((_, i) => ({
  name: `M${i + 1}`,
  value: Math.round(Math.random() * 100),
}));

export const Default = () => (
  <div style={{ width: 360 }}>
    <SimpleAreaChart data={data} />
  </div>
);
