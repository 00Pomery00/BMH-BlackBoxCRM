import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#7b1fa2', '#0ea5a4', '#10b981', '#ef4444', '#f59e0b'];

export default function SimplePieChart({ data = [], dataKey = 'value' }) {
  return (
    <div style={{ width: '100%', height: 200 }} className="card">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey="name"
            innerRadius={40}
            outerRadius={70}
            fill="#8884d8"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
