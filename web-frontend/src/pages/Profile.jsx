import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  }

  return (
    <section
      className="max-w-lg mx-auto bg-white p-6 rounded shadow"
      data-id="profile-panel"
      data-category="panel"
    >
      <h2 className="text-xl font-semibold mb-4">{t('profile_settings', 'Nastavení profilu')}</h2>
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
          className="bg-violet-600 text-white px-4 py-2 rounded"
          data-id="profile-save"
          data-category="tlacitko"
        >
          {t('save')}
        </button>
        {msg && <div className="text-green-600 mt-2">{msg}</div>}
      </form>
    </section>
  );
}
