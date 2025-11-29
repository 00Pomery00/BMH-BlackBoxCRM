import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Login({ onLogin }) {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">{t('login') || 'Přihlášení'}</h2>
      <p className="text-sm text-gray-600 mb-4">
        {t('login_help') || 'Pro jednoduchost stiskněte tlačítko pro přihlášení.'}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onLogin && onLogin()}
          className="px-4 py-2 bg-violet-600 text-white rounded"
          data-testid="login-button"
        >
          {t('login') || 'Přihlásit'}
        </button>
      </div>
    </div>
  );
}
