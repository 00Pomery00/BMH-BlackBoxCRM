import React from 'react';

export default function GamificationPanel({ stats = {} }) {
  return (
    <section className="mb-6 p-4 bg-white rounded shadow-sm">
      <h2 className="text-lg font-medium mb-2">Gamification</h2>
      <div className="flex gap-4">
        <div>XP: {stats.XP ?? 0}</div>
        <div>SalesCoins: {stats.SalesCoins ?? 0}</div>
        <div>Level: {stats.Level ?? 1}</div>
      </div>
    </section>
  );
}
