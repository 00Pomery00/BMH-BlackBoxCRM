import React from 'react'
import { View, Text } from 'react-native'

export default function MapScreen({ leads = [] }) {
  return (
    <View style={{ height: 200, backgroundColor: '#f3f4f6', borderRadius: 8, padding: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Map (demo)</Text>
      <Text>Leads stored offline: {leads.length}</Text>
    </View>
  )
}
