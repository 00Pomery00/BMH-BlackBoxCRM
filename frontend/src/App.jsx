import React, { useEffect, useState } from 'react'

export default function App(){
  const [health, setHealth] = useState(null)
  useEffect(()=>{
    fetch('/api/v1/ds/schemas').then(r=>r.json()).then(data=>setHealth(data)).catch(()=>setHealth(null))
  },[])
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">BlackBox CRM — Frontend (skeleton)</h1>
      <pre className="mt-4">{JSON.stringify(health,null,2)}</pre>
    </div>
  )
}
