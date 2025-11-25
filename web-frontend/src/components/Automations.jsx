import React, { useEffect, useState } from 'react'
import { listAutomations, createAutomation, runAutomation } from '../api'

export default function Automations() {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDef, setNewDef] = useState('{\n  "steps": []\n}')
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await listAutomations()
      setFlows(data.automations || [])
    } catch (e) {
      setMessage(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setMessage('')
    try {
      const payload = { name: newName, definition: newDef }
      const res = await createAutomation(payload)
      if (!res.ok) {
        const txt = await res.text()
        setMessage('Create failed: ' + txt)
        return
      }
      setNewName('')
      setNewDef('{\n  "steps": []\n}')
      await load()
      setMessage('Created')
    } catch (err) {
      setMessage(String(err))
    }
  }

  async function handleRun(id) {
    setMessage('Running...')
    try {
      const res = await runAutomation(id, { dry_run: true })
      const json = await res.json()
      setMessage('Run result: ' + JSON.stringify(json).slice(0, 300))
    } catch (err) {
      setMessage(String(err))
    }
  }

  return (
    <div className="p-4 rounded border mt-4">
      <h2 className="text-xl font-semibold mb-2">Automations (admin)</h2>
      {message && <div className="mb-2 text-sm text-gray-700">{message}</div>}
      <div className="mb-4">
        <form onSubmit={handleCreate} className="space-y-2">
          <div>
            <input className="border px-2 py-1 w-full" placeholder="Flow name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </div>
          <div>
            <textarea className="border px-2 py-1 w-full h-32 font-mono text-sm" value={newDef} onChange={(e) => setNewDef(e.target.value)} />
          </div>
          <div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Create (validate)</button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="font-medium mb-2">Existing flows</h3>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-2">
            {flows.length === 0 && <div className="text-sm text-gray-500">No flows</div>}
            {flows.map((f) => (
              <div key={f.id} className="p-2 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{f.name}</div>
                </div>
                <div className="space-x-2">
                  <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleRun(f.id)}>Dry-run</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
