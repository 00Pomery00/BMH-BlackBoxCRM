import React from 'react';
import Dashboard from '../../components/Dashboard';

export default {
  title: 'Pages/Dashboard',
  component: Dashboard,
};

const sampleCompanies = [
  { id: 1, name: 'Acme Corp', lead_score: 78 },
  { id: 2, name: 'Beta LLC', lead_score: 45 },
  { id: 3, name: 'Gamma Inc', lead_score: 62 },
];

export const Default = () => (
  <div style={{ padding: 20 }}>
    <Dashboard companies={sampleCompanies} />
  </div>
);
