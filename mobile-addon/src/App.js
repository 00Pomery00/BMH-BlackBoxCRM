import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, Button } from 'react-native'
import MapScreen from './screens/MapScreen'
import ScanScreen from './screens/ScanScreen'
import { getOfflineLeads, addOfflineLead } from './offlineCache'
import { getGamification } from './gamification'

export default function App() {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    setLeads(getOfflineLeads())
    setStats(getGamification(1))
  }, [])

  const onScan = (lead) => {
    addOfflineLead(lead)
    setLeads(getOfflineLeads())
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>BlackBox Mobile Addon</Text>
      <ScanScreen onScan={onScan} />
      <MapScreen leads={leads} />
      <Text style={{ marginTop: 12 }}>XP: {stats.XP} | SalesCoins: {stats.SalesCoins} | Level: {stats.Level}</Text>
    </ScrollView>
  )
}
