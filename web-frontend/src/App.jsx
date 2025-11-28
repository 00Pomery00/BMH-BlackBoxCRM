import React, { useEffect, useState } from 'react';
import './i18n';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GamificationPanel from './components/GamificationPanel';
import MapView from './components/MapView';
import Automations from './components/Automations';
import { fetchCompanies, fetchGamification } from './api';
import AdminTelemetry from './components/AdminTelemetry';
import Login from './components/Login';

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Header onLogout={() => setIsLoggedIn(false)} />

      <GamificationPanel stats={gamification} />
      {!isLoggedIn && <Login onLogin={() => setIsLoggedIn(true)} />}
      <Dashboard companies={companies} />
      <MapView companies={companies} />
      <div className="mt-8">
        <Automations />
      </div>
      {/* admin telemetry - visible when user role is admin */}
      {window._BBX && window._BBX.role === 'admin' && <AdminTelemetry />}
    </div>
  );
}
