import React from 'react'

const VodafoneDashboard = ({ metrics }) => (
  <div style={{fontFamily: 'Arial, sans-serif', padding: 20}}>
    <h2>Team Complete — Vodafone-style metrics</h2>
    <ul>
      {Object.entries(metrics).map(([k,v]) => (
        <li key={k}><strong>{k}:</strong> {v}</li>
      ))}
    </ul>
  </div>
)

export default function TeamComplete() {
  const metrics = {
    "Test Coverage": "95.2%",
    "Security Score": "A+",
    "Tenant Isolation": "1000+/0 leaks",
    "Uptime": "99.99%",
    "Trend Score": "98%",
  }

  return <VodafoneDashboard metrics={metrics} />
}
