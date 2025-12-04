import React from 'react';

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside
      className="flex flex-col py-6 px-0 shadow-lg"
      style={{
        width: 'var(--sidebar-width)',
        background: 'linear-gradient(180deg, var(--accent), var(--violet-dark))',
        color: 'var(--sidebar-text, white)',
      }}
    >
      <div className="mb-8 px-6 flex items-center gap-3">
        <img src="/logo.png" alt="logo" className="w-10 h-10 rounded bg-white p-1" />
        <span className="text-2xl font-bold tracking-wide">BlackBox</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-2">
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            page === 'home' ? 'bg-violet-600/80' : ''
          }`}
          onClick={() => onNavigate('home')}
        >
          <span className="material-icons">dashboard</span> <span>Dashboard</span>
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            page === 'leads' ? 'bg-violet-600/80' : ''
          }`}
          onClick={() => onNavigate('leads')}
        >
          <span className="material-icons">list_alt</span> <span>Leady</span>
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            page === 'companies' ? 'bg-violet-600/80' : ''
          }`}
          onClick={() => onNavigate('companies')}
        >
          <span className="material-icons">business</span> <span>Firmy</span>
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            page === 'stats' ? 'bg-violet-600/80' : ''
          }`}
          onClick={() => onNavigate('stats')}
        >
          <span className="material-icons">bar_chart</span> <span>Statistiky</span>
        </button>
        <button
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
            page === 'profile' ? 'bg-violet-600/80' : ''
          }`}
          onClick={() => onNavigate('profile')}
        >
          <span className="material-icons">person</span> <span>Profil</span>
        </button>
      </nav>
      <div className="mt-8 px-6">
        <button
          onClick={() => {
            window.localStorage.removeItem('bbx_token');
            if (typeof onNavigate === 'function') onNavigate('login');
          }}
          className="flex items-center gap-2 text-sm text-violet-200 hover:text-white"
        >
          <span className="material-icons">logout</span> Odhlásit
        </button>
      </div>
    </aside>
  );
}
