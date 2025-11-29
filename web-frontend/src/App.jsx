import React, { useEffect, useState } from 'react';
import './i18n';

import Header from './components/Header';
import { fetchCompanies, fetchGamification } from './api';
import Login from './components/Login';
import AdminTelemetry from './components/AdminTelemetry';
import Home from './pages/Home';
import Leads from './pages/Leads';
import Companies from './pages/Companies';
import Stats from './pages/Stats';
import Profile from './pages/Profile';

export default function App() {
  useEffect(() => {
    // Example: if the app receives session info via storage or message,
    // set it on the global BBX for telemetry to pick up.
    const s = window.localStorage.getItem('bbx_session');
    if (s) {
      try {
        const info = JSON.parse(s);
        window.BBXSetSession(info);
      } catch (e) {
        console.error('Failed to parse bbx_session', e);
      }
    }
  }, []);
  // useTranslation not required here; i18n is initialized globally via ./i18n
  const [companies, setCompanies] = useState([]);
  const [gamification, setGamification] = useState({});

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(console.error);
    fetchGamification().then(setGamification).catch(console.error);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('bbx_token'));

  // jednoduchý router (stavová proměnná)
  const [page, setPage] = useState('home');

  if (!isLoggedIn) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Header onLogout={() => setIsLoggedIn(false)} />
        <Login onLogin={() => setIsLoggedIn(true)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigace s ikonami */}
      <aside className="w-60 bg-gradient-to-b from-violet-800 to-violet-900 text-white flex flex-col py-6 px-0 shadow-lg">
        <div className="mb-8 px-6 flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-10 h-10 rounded bg-white p-1" />
          <span className="text-2xl font-bold tracking-wide">BlackBox</span>
        </div>
        <nav className="flex-1 flex flex-col gap-1 px-2">
          <button className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page==='home'?'bg-violet-600/80':''}`} onClick={()=>setPage('home')}>
            <span className="material-icons">dashboard</span> <span>Dashboard</span>
          </button>
          <button className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page==='leads'?'bg-violet-600/80':''}`} onClick={()=>setPage('leads')}>
            <span className="material-icons">list_alt</span> <span>Leady</span>
          </button>
          <button className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page==='companies'?'bg-violet-600/80':''}`} onClick={()=>setPage('companies')}>
            <span className="material-icons">business</span> <span>Firmy</span>
          </button>
          <button className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page==='stats'?'bg-violet-600/80':''}`} onClick={()=>setPage('stats')}>
            <span className="material-icons">bar_chart</span> <span>Statistiky</span>
          </button>
          <button className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${page==='profile'?'bg-violet-600/80':''}`} onClick={()=>setPage('profile')}>
            <span className="material-icons">person</span> <span>Profil</span>
          </button>
        </nav>
        <div className="mt-8 px-6">
          <button onClick={()=>{window.localStorage.removeItem('bbx_token'); setIsLoggedIn(false);}} className="flex items-center gap-2 text-sm text-violet-200 hover:text-white">
            <span className="material-icons">logout</span> Odhlásit
          </button>
        </div>
      </aside>
      {/* Hlavní obsah s horním headerem ala webkit-admin */}
      <main className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-8 py-4 bg-white shadow-sm border-b">
          <Header onLogout={() => setIsLoggedIn(false)} />
          {/* User box vpravo nahoře */}
          <div className="flex items-center gap-3">
            <img src="/avatar.png" alt="avatar" className="w-9 h-9 rounded-full border-2 border-violet-400" />
            <div className="text-sm font-medium text-gray-700">{window._BBX?.username || 'Uživatel'}</div>
          </div>
        </div>
        <div className="flex-1 p-8">
          {page === 'home' && <Home companies={companies} onNavigate={setPage} />}
          {page === 'leads' && <Leads companies={companies} />}
          {page === 'companies' && <Companies companies={companies} />}
          {page === 'stats' && <Stats />}
          {page === 'profile' && <Profile />}
          {/* admin telemetry - pouze pro admina */}
          {window._BBX && window._BBX.role === 'admin' && <AdminTelemetry />}
        </div>
      </main>
    </div>
  );
}
