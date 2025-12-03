import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SimpleLineChart({
  data = [],
  dataKey = 'value',
  color = 'var(--primary)',
}) {
  return (
    <div style={{ width: '100%', height: 160 }} className="card">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
