import React from 'react';
import Sparkline from '../../components/ui/Sparkline';

export default {
  title: 'UI/Sparkline',
  component: Sparkline,
};

const data = [
  { value: 10 },
  { value: 30 },
  { value: 20 },
  { value: 50 },
  { value: 40 },
  { value: 60 },
];

export const Default = () => (
  <div style={{ width: 200 }}>
    <Sparkline data={data} />
  </div>
);
