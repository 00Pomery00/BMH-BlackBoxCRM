import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminTelemetry() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchSummary() {
    setLoading(true);
    setError(null);
    try {
      const token = window.localStorage.getItem('bbx_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const resp = await fetch('/admin/telemetry/summary', { headers });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status}: ${text}`);
      }
      const data = await resp.json();
      setSummary(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto-fetch if looks like admin
    const role = window._BBX && window._BBX.role;
    if (role === 'admin') fetchSummary();
  }, []);

  return (
    <div className="border p-4 rounded bg-white shadow mt-6">
      <h2 className="text-xl font-semibold mb-2">{t('admin_telemetry_summary')}</h2>
      <div className="mb-3">
        <button
          className="px-3 py-1 bg-blue-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onClick={fetchSummary}
          disabled={loading}
        >
          {loading ? t('loading') : t('refresh')}
        </button>
      </div>
      {error && (
        <div className="text-red-600">
          {t('error')}: {error}
        </div>
      )}
      {summary ? (
        <div>
          <div className="mb-2">
            {t('total_events')}: <strong>{summary.total_events}</strong>
          </div>
          <div className="mb-2">
            {t('active_sessions')}: <strong>{summary.active_sessions}</strong>
          </div>
          <div className="mb-4">
            <div className="font-medium">{t('events_by_type')}</div>
            <ul className="list-disc pl-6">
              {summary.events_by_type.map((e) => (
                <li key={e.type}>
                  {e.type}: {e.count}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-medium">{t('top_paths')}</div>
            <ul className="list-disc pl-6">
              {summary.top_paths.map((p) => (
                <li key={p.path}>
                  {p.path}: {p.count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">{t('no_data_admin')}</div>
      )}
    </div>
  );
}
