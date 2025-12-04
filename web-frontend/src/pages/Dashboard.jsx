import React, { useEffect, useState } from 'react';
import DashboardComponent from '../components/Dashboard';
import { fetchCompanies } from '../api';

export default function DashboardPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchCompanies()
      .then((data) => {
        if (mounted) setCompanies(data || []);
      })
      .catch(() => {
        // ignore, keep empty for placeholder
      });
    return () => (mounted = false);
  }, []);

  return (
    <div className="p-6">
      <DashboardComponent companies={companies} />
    </div>
  );
}
