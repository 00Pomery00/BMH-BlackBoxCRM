import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Secret123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function doLogin() {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/fu_auth/jwt/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) throw new Error('Login failed ' + resp.status);
      const json = await resp.json();
      const token = json.access_token || json.token || json.accessToken;
      const sessionId = json.session_id || json.sessionId || null;
      if (token) {
        try {
          localStorage.setItem('bbx_token', token);
        } catch (e) {
          console.error('localStorage set bbx_token failed', e);
        }
        try {
          localStorage.setItem('bbx_session', JSON.stringify({ session_id: sessionId }));
        } catch (e) {
          console.error('localStorage set bbx_session failed', e);
        }
        window.BBXSetSession({ session_id: sessionId });
        // fetch /auth/me to get role/user
        try {
          const me = await fetch('/auth/me', { headers: { Authorization: 'Bearer ' + token } });
          if (me.ok) {
            const mejson = await me.json();
            try {
              localStorage.setItem('bbx_user', JSON.stringify(mejson));
            } catch (e) {
              console.error('localStorage set bbx_user failed', e);
            }
            window.BBXSetSession({ user_id: mejson.id, role: mejson.role });
            window._BBX.role = mejson.role;
          }
        } catch (e) {
          console.error('Fetching /auth/me failed', e);
        }
        if (onLogin) onLogin();
      } else {
        throw new Error('No token');
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow mb-4" role="region" aria-label={t('login')}>
      <h3 className="font-semibold mb-2">{t('login')}</h3>
      {error && (
        <div className="text-red-600 mb-2" role="alert">
          {error}
        </div>
      )}
      <div className="mb-2">
        <input
          aria-label={t('username_or_email')}
          className="border p-2 w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t('username_or_email')}
        />
      </div>
      <div className="mb-2">
        <input
          aria-label={t('password')}
          type="password"
          className="border p-2 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
        />
      </div>
      <div>
        <button
          className="px-3 py-1 bg-green-600 text-white rounded"
          onClick={doLogin}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? t('logging') : t('login')}
        </button>
      </div>
    </div>
  );
}
