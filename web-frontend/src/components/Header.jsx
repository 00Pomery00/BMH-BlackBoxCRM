import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Header({ onLogout } = {}) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem('bbx_theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('bbx_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function changeLang(ev) {
    const lng = ev.target.value;
    i18n.changeLanguage(lng);
    localStorage.setItem('bbx_lang', lng);
  }

  const user = window._BBX && window._BBX.username ? window._BBX : null;

  return (
    <header
      data-testid="app-header"
      className="mb-6 flex items-center justify-between"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt={t('app_title')} className="w-10 h-10" />
        <div>
          <div className="text-lg font-semibold">{t('app_title')}</div>
          <div className="text-xs text-slate-200">{t('app_subtitle')}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={i18n.language || localStorage.getItem('bbx_lang') || 'cs'}
          onChange={changeLang}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="cs">Česky</option>
          <option value="en">English</option>
        </select>

        <button
          onClick={toggleTheme}
          title={t('toggle_theme', 'Toggle theme')}
          className="px-3 py-1 border rounded text-sm"
        >
          {theme === 'dark' ? t('dark') : t('light')}
        </button>

        {user ? (
          <div className="flex items-center gap-2 border rounded px-3 py-1">
            <div className="text-sm">{user.username}</div>
            <div className="text-xs text-slate-500">{user.role}</div>
            <button
              onClick={() => {
                window.localStorage.removeItem('bbx_token');
                window.localStorage.removeItem('bbx_session');
                if (onLogout) onLogout();
              }}
              className="ml-2 text-xs text-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              aria-label={t('logout')}
              data-testid="btn-logout"
            >
              {t('logout')}
            </button>
          </div>
        ) : (
          <a data-testid="link-login" href="/login" className="text-sm border px-3 py-1 rounded">
            {t('login')}
          </a>
        )}
      </div>
    </header>
  );
}
