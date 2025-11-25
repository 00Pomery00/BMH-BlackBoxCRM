import React, { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import GamificationPanel from './components/GamificationPanel'
import MapView from './components/MapView'
import { fetchCompanies, fetchGamification } from './api'

export default function App() {
  const [companies, setCompanies] = useState([])
  const [gamification, setGamification] = useState({})

  useEffect(() => {
    fetchCompanies().then(setCompanies).catch(console.error)
    fetchGamification().then(setGamification).catch(console.error)
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <img src="/logo.png" alt="BlackBox CRM" className="w-12 h-12" />
        <h1 className="text-3xl font-bold">BlackBox CRM Dashboard</h1>
      </div>
      <GamificationPanel stats={gamification} />
      <Dashboard companies={companies} />
      <MapView companies={companies} />
    </div>
  )
}
