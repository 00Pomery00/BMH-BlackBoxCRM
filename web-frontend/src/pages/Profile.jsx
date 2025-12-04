import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardBuilder from '../components/DashboardBuilder';

export default function Profile() {
  const { t, i18n } = useTranslation();
  // Simulace uživatelských dat (v reálné aplikaci načíst z API)
  const [profile, setProfile] = useState({
    username: window._BBX?.username || '',
    email: window._BBX?.email || '',
    lang: i18n.language || 'cs',
    avatar: '',
    showIds: localStorage.getItem('bbx_showIds') === '1',
    showCategories: localStorage.getItem('bbx_showCategories') === '1',
  });
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'theme', 'dashboard'
  const [uiSettings, setUiSettings] = useState(() => {
    try {
      const s = localStorage.getItem('bbx_ui_settings');
      return s
        ? JSON.parse(s)
        : {
            theme: localStorage.getItem('bbx_theme') || 'light',
            accent: null,
            violet: null,
            violetDark: null,
            sidebarWidth: null,
            dashboardConfig: {
              enabledWidgets: ['kpi_customers', 'kpi_revenue', 'kpi_invoices', 'kpi_profit'],
              widgetConfigs: {},
              widgetOrder: [],
            },
          };
    } catch (e) {
      return { theme: localStorage.getItem('bbx_theme') || 'light' };
    }
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setProfile((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Zde by bylo volání API pro uložení profilu
    setMsg(t('profile_saved', 'Profil uložen.'));
    // Simulace změny jazyka
    i18n.changeLanguage(profile.lang);
    localStorage.setItem('bbx_showIds', profile.showIds ? '1' : '0');
    localStorage.setItem('bbx_showCategories', profile.showCategories ? '1' : '0');
    // Save UI settings and apply immediately
    try {
      const prev = JSON.parse(localStorage.getItem('bbx_ui_settings') || '{}');
      const merged = { ...prev, ...uiSettings };
      localStorage.setItem('bbx_ui_settings', JSON.stringify(merged));
      if (merged.theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      if (merged.accent) document.documentElement.style.setProperty('--accent', merged.accent);
      if (merged.violet) document.documentElement.style.setProperty('--violet', merged.violet);
      if (merged.violetDark)
        document.documentElement.style.setProperty('--violet-dark', merged.violetDark);
      if (merged.bg) document.documentElement.style.setProperty('--bg', merged.bg);
      if (merged.cardBg) document.documentElement.style.setProperty('--card-bg', merged.cardBg);
      if (merged.sidebarWidth)
        document.documentElement.style.setProperty('--sidebar-width', `${merged.sidebarWidth}px`);
      // store theme separately for Header compatibility
      localStorage.setItem('bbx_theme', merged.theme || 'light');
    } catch (e) {
      console.error('Failed to save ui settings', e);
    }
    // If user is authenticated, persist to backend as well
    try {
      const token = localStorage.getItem('bbx_token');
      if (token) {
        fetch('/api/ui/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ settings: uiSettings }),
        }).catch((err) => console.warn('Failed to persist ui settings to backend', err));
      }
    } catch (e) {
      console.warn('Persist to backend failed', e);
    }
  }

  function handleUiChange(e) {
    const { name, value, type, checked } = e.target;
    setUiSettings((u) => ({ ...u, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleDashboardConfigChange(newConfig) {
    setUiSettings((u) => ({
      ...u,
      dashboardConfig: newConfig,
    }));
  }

  return (
    <section
      className="max-w-4xl mx-auto bg-white p-6 rounded shadow"
      data-id="profile-panel"
      data-category="panel"
    >
      <h2 className="text-xl font-semibold mb-6">{t('profile_settings', 'Nastavení profilu')}</h2>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Obecné
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'theme'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Vzhled
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'dashboard'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Moje Komponenty
        </button>
      </div>

      {/* TAB: General */}
      {activeTab === 'general' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('username')}</label>
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              data-id="profile-username"
              data-category="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('email')}</label>
            <input
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              data-id="profile-email"
              data-category="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('language')}</label>
            <select
              name="lang"
              value={profile.lang}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              data-id="profile-lang"
              data-category="select"
            >
              <option value="cs">Čeština</option>
              <option value="en">English</option>
            </select>
          </div>
          {/* Avatar upload placeholder */}
          <div>
            <label className="block text-sm font-medium mb-1">{t('avatar')}</label>
            <input
              name="avatar"
              type="file"
              disabled
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              data-id="profile-avatar"
              data-category="input"
            />
          </div>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showIds"
                checked={profile.showIds}
                onChange={handleChange}
                data-id="profile-showids"
                data-category="toggle"
              />
              Zobrazovat ID prvků
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="showCategories"
                checked={profile.showCategories}
                onChange={handleChange}
                data-id="profile-showcategories"
                data-category="toggle"
              />
              Zobrazovat kategorie prvků
            </label>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            data-id="profile-save-general"
            data-category="tlacitko"
          >
            {t('save')}
          </button>
          {msg && <div className="text-green-600 mt-2">{msg}</div>}
        </form>
      )}

      {/* TAB: Theme */}
      {activeTab === 'theme' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Režim</label>
              <select
                name="theme"
                value={uiSettings.theme || 'light'}
                onChange={handleUiChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="light">Světlý</option>
                <option value="dark">Tmavý</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barva akcentu</label>
              <input
                type="color"
                name="accent"
                value={uiSettings.accent || '#7b1fa2'}
                onChange={handleUiChange}
                className="w-full h-10 p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tmavší odstín akcentu (volitelně)
              </label>
              <input
                type="color"
                name="violetDark"
                value={uiSettings.violetDark || '#5e0f86'}
                onChange={handleUiChange}
                className="w-full h-10 p-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Šířka bočního menu (px)</label>
              <input
                name="sidebarWidth"
                type="number"
                value={uiSettings.sidebarWidth || 240}
                onChange={handleUiChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            data-id="profile-save-theme"
            data-category="tlacitko"
          >
            {t('save')}
          </button>
          {msg && <div className="text-green-600 mt-2">{msg}</div>}
        </form>
      )}

      {/* TAB: Dashboard Config */}
      {activeTab === 'dashboard' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
            ℹ️ Zde si můžete vybrat, které komponenty (grafy, tabulky, karty, widgety) se zobrazují
            na vašem dashboardu. Změňte pořadí tlačítky ↑/↓ a konfigurujte jednotlivé komponenty.
          </div>
          <DashboardBuilder
            initialConfig={uiSettings.dashboardConfig || {}}
            onChange={handleDashboardConfigChange}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            data-id="profile-save-dashboard"
            data-category="tlacitko"
          >
            {t('save')}
          </button>
          {msg && <div className="text-green-600 mt-2">{msg}</div>}
        </form>
      )}
    </section>
  );
}
