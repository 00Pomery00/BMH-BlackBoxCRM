import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SimpleAreaChart({
  data = [],
  dataKey = 'value',
  color = 'var(--primary)',
}) {
  return (
    <div style={{ width: '100%', height: 180 }} className="card">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.12} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
