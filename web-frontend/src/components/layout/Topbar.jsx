import React from 'react';
import Header from '../Header';

export default function Topbar({ onLogout }) {
  const user = window._BBX && window._BBX.username ? window._BBX : null;

  return (
    <div
      className="flex items-center justify-between px-8 py-4 shadow-sm border-b"
      style={{ backgroundColor: 'var(--topbar-bg, white)' }}
    >
      <Header onLogout={onLogout} />
      <div className="flex items-center gap-3">
        <img
          src="/avatar.png"
          alt="avatar"
          className="w-9 h-9 rounded-full border-2 border-violet-400"
        />
        <div className="text-sm font-medium text-gray-700">{user?.username || 'Uživatel'}</div>
      </div>
    </div>
  );
}
