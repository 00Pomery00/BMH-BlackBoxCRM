import React from 'react';

export default function GamificationPanel({ stats = {} }) {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-medium mb-2">Gamifikace</h2>
      <div className="flex gap-4">
        <div>XP: {stats.XP ?? 0}</div>
        <div>SalesCoiny: {stats.SalesCoins ?? 0}</div>
        <div>Úroveň: {stats.Level ?? 1}</div>
      </div>
    </section>
  );
}
