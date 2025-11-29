import React from 'react';
import Dashboard from '../components/Dashboard';

export default function Home({ companies, onNavigate }) {
  // Dashboard je výchozí domovská stránka
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
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('leads')}
          >
            <span className="material-icons">list_alt</span> Leady
          </button>
          <button
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('companies')}
          >
            <span className="material-icons">business</span> Firmy
          </button>
          <button
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded flex items-center gap-2 shadow"
            onClick={() => onNavigate?.('stats')}
          >
            <span className="material-icons">bar_chart</span> Statistiky
          </button>
        </div>
      </div>
      <Dashboard companies={companies} />
    </>
  );
}
