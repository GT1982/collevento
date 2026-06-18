import React, { useState } from 'react'

export default function Landing(){
  const [joinId, setJoinId] = useState('')
  const [creating, setCreating] = useState(false)

  async function createSession(){
    setCreating(true)
      const res = await fetch('/api/sessions', { method: 'POST' })
    const data = await res.json()
    window.location.hash = `#/session/${data.id}`
  }

  function join(){
    if (!joinId) return alert('Inserisci ID sessione')
    window.location.hash = `#/session/${joinId}`
  }

  return (
    <div style={{width:'100%', display:'flex', justifyContent:'flex-end'}}>
      <div className="app" style={{marginLeft: 'auto', marginRight: 24, width: '651px'}}>
        <div className="header">
          <h1>ColleVento — Benvenuto viandante</h1>
        </div>
        <p>Genera una nuova sessione o entra con un ID esistente.</p>

        <div style={{display:'flex', flexDirection:'column', gap:12, alignItems:'flex-start'}}>
          {/* First row: create session */}
          <div>
            <button className="button" onClick={createSession} disabled={creating} style={{width:260}}>Crea una nuova sessione</button>
          </div>

          {/* Second row: join button and input */}
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <button className="button" onClick={join} style={{width:260}}>Entra in sessione</button>
            <input id="joinId" aria-label="ID sessione" placeholder="Inserisci ID sessione" value={joinId} onChange={e=>setJoinId(e.target.value)} style={{minWidth:180, padding:'8px 10px', borderRadius:6, border:'1px solid rgba(120,80,50,0.4)'}} />
          </div>
        </div>
      </div>
    </div>
  )
}
