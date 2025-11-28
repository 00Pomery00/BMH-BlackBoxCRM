import React from "react";
import useWidgets from "./hooks/useWidgets";

export default function App() {
  const { listWidgets } = useWidgets();
  const widgets = listWidgets();

  return (
    <div style={{ padding: 20, fontFamily: 'Segoe UI, Roboto, Arial' }}>
      <h1>CRM Blackbox — Frontend Scaffold</h1>
      <p>Registered widgets:</p>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {widgets.map((w) => {
          const Component = w.component as any;
          return (
            <div key={w.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#374151' }}>{w.label} <small style={{ color:'#9ca3af' }}>({w.id})</small></div>
              <div style={{ marginTop: 8 }}>
                <Component title={w.label} value={Math.floor(Math.random() * 100)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
