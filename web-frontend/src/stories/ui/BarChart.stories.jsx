import React from 'react';
import SimpleBarChart from '../../components/ui/BarChart';

export default {
  title: 'UI/BarChart',
  component: SimpleBarChart,
};

const data = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 50 },
  { name: 'Thu', value: 70 },
  { name: 'Fri', value: 60 },
];

export const Default = () => (
  <div style={{ width: 400, height: 200 }}>
    <SimpleBarChart data={data} />
  </div>
);
