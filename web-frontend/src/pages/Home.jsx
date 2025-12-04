import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';
import DynamicDashboard from '../components/DynamicDashboard';

export default function Home({ companies, onNavigate }) {
  const [useDynamic, setUseDynamic] = useState(true); // Výchozí: DynamicDashboard

  // Demo data
  const gamification = { XP: 1250, SalesCoins: 450, Level: 5 };
  const activities = [
    { id: 1, user: 'John Doe', action: 'created lead', time: '2 hours ago' },
    { id: 2, user: 'Jane Smith', action: 'closed deal', time: '4 hours ago' },
  ];

  return (
    <>
      <div className="mb-8 p-6 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Vítejte v BlackBox CRM</h1>
          <div className="text-gray-600">
            Moderní portál pro správu leadů, firem a statistik. Vše na jednom místě.
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('leads')}
          >
            <span>📋</span> Leady
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('companies')}
          >
            <span>🏢</span> Firmy
          </button>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('stats')}
          >
            <span>📊</span> Statistiky
          </button>
        </div>
      </div>

      {/* Toggle mezi klasickým a dynamickým dashboardem */}
      <div className="mb-4 flex gap-2 justify-center">
        <button
          onClick={() => setUseDynamic(false)}
          className={`px-4 py-2 rounded font-medium transition ${
            !useDynamic ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Klasický Dashboard
        </button>
        <button
          onClick={() => setUseDynamic(true)}
          className={`px-4 py-2 rounded font-medium transition ${
            useDynamic ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Moje Komponenty
        </button>
      </div>

      {/* Render dashboardu */}
      {useDynamic ? (
        <DynamicDashboard
          companies={companies}
          gamification={gamification}
          activities={activities}
        />
      ) : (
        <Dashboard companies={companies} />
      )}
    </>
  );
}
