import React from 'react'
import { View, Text, Button, TextInput } from 'react-native'

export default function ScanScreen({ onScan }) {
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')

  const submit = () => {
    const lead = { name, email, lead_score: 0 }
    onScan(lead)
    setName('')
    setEmail('')
  }

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontWeight: '600', marginBottom: 6 }}>Scan / Enter Lead</Text>
      <TextInput placeholder="Company or person" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 8, marginBottom: 6 }} keyboardType="email-address" />
      <Button title="Save Offline" onPress={submit} />
    </View>
  )
}
