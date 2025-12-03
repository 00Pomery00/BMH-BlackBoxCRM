import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data = [], color = '#7b1fa2', height = 40 }) {
  const normalized = Array.isArray(data) ? data : [];
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={normalized}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
