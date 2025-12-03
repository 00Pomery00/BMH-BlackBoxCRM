import React, { useEffect, useState } from 'react';
import './i18n';

import Header from './components/Header';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Footer from './components/layout/Footer';
import { fetchCompanies } from './api';
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
  // Apply saved UI settings (theme, colors, sidebar width)
  useEffect(() => {
    const s = localStorage.getItem('bbx_ui_settings');
    if (!s) return;
    try {
      const cfg = JSON.parse(s);
      if (cfg.accent) document.documentElement.style.setProperty('--accent', cfg.accent);
      if (cfg.violet) document.documentElement.style.setProperty('--violet', cfg.violet);
      if (cfg.violetDark)
        document.documentElement.style.setProperty('--violet-dark', cfg.violetDark);
      if (cfg.bg) document.documentElement.style.setProperty('--bg', cfg.bg);
      if (cfg.cardBg) document.documentElement.style.setProperty('--card-bg', cfg.cardBg);
      if (cfg.sidebarWidth)
        document.documentElement.style.setProperty('--sidebar-width', `${cfg.sidebarWidth}px`);
      if (cfg.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {
      console.error('Failed to apply ui settings', e);
    }
  }, []);

  // If user is logged in, try to fetch persisted settings from backend and merge
  useEffect(() => {
    const token = localStorage.getItem('bbx_token');
    if (!token) return;
    fetch('/api/ui/settings', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('no-settings');
        return r.json();
      })
      .then((data) => {
        try {
          const cfg = data.settings || {};
          // apply each known setting
          if (cfg.accent) document.documentElement.style.setProperty('--accent', cfg.accent);
          if (cfg.violet) document.documentElement.style.setProperty('--violet', cfg.violet);
          if (cfg.violetDark)
            document.documentElement.style.setProperty('--violet-dark', cfg.violetDark);
          if (cfg.bg) document.documentElement.style.setProperty('--bg', cfg.bg);
          if (cfg.cardBg) document.documentElement.style.setProperty('--card-bg', cfg.cardBg);
          if (cfg.sidebarWidth)
            document.documentElement.style.setProperty('--sidebar-width', `${cfg.sidebarWidth}px`);
          if (cfg.theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        } catch (e) {
          console.warn('Failed to apply remote ui settings', e);
        }
      })
      .catch(() => {});
  }, []);
  // useTranslation not required here; i18n is initialized globally via ./i18n
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(console.error);
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
      <Sidebar page={page} onNavigate={setPage} />
      {/* Hlavní obsah s horním headerem ala webkit-admin */}
      <main className="flex-1 flex flex-col">
        <Topbar onLogout={() => setIsLoggedIn(false)} />
        <div className="flex-1 p-8">
          {page === 'home' && <Home companies={companies} onNavigate={setPage} />}
          {page === 'leads' && <Leads companies={companies} />}
          {page === 'companies' && <Companies companies={companies} />}
          {page === 'stats' && <Stats />}
          {page === 'profile' && <Profile />}
          {/* admin telemetry - pouze pro admina */}
          {window._BBX && window._BBX.role === 'admin' && <AdminTelemetry />}
        </div>
        <Footer />
      </main>
    </div>
  );
}
