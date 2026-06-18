import React, { useEffect, useState } from 'react'

type MixedDraw = { deck: 'major'|'minor', filename: string };

type State = {
  id: string;
  selectedMajor: string | null;
  selectedMinor: string | null;
  majorDraws: string[];
  minorDraws: string[];
  mixedDraws: MixedDraw[];
}

export default function Session({ sessionId }: { sessionId: string }){
  const [state, setState] = useState<State | null>(null)
  const [majors, setMajors] = useState<string[]>([])
  const [minors, setMinors] = useState<string[]>([])

  useEffect(()=>{
    async function load(){
      const sres = await fetch(`/api/sessions/${sessionId}`)
      if (sres.ok) setState(await sres.json())
      try {
        // fetch manifest with lists of files (must be generated under client/public/resource/manifest.json)
        const r = await fetch('/resource/manifest.json')
        const j = await r.json(); setMajors(j.majors || []); setMinors(j.minors || []);
      } catch(e){ console.error(e) }
    }
    load()

  },[sessionId])

  async function selectCard(deck: 'major'|'minor', filename: string | null){
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({action:'select', deck: deck==='major' ? 'major' : 'minor', filename})
    })
    const r = await fetch(`/api/sessions/${sessionId}`)
    setState(await r.json())
  }

  async function draw(deck: 'arcani-maggiori'|'arcani-minori'|'mixed'){
    try {
      let chosen: {deck:'major'|'minor', filename:string} | null = null
      if (deck === 'arcani-maggiori') {
        if (!majors.length) return alert('Deck vuoto')
        const drawn = state?.majorDraws || []
        const available = majors.filter(f => !drawn.includes(f))
        if (!available.length) return alert('Nessun Arcano Maggiore rimasto disponibile per la stesura')
        const f = available[Math.floor(Math.random()*available.length)];
        chosen = { deck: 'major', filename: f }
      } else if (deck === 'arcani-minori') {
        if (!minors.length) return alert('Deck vuoto')
        const drawn = state?.minorDraws || []
        const available = minors.filter(f => !drawn.includes(f))
        if (!available.length) return alert('Nessun Arcano Minore rimasto disponibile per la stesura')
        const f = available[Math.floor(Math.random()*available.length)];
        chosen = { deck: 'minor', filename: f }
      } else if (deck === 'mixed') {
        const drawn = state?.mixedDraws || []
        const availableMajors = majors.filter(f => !drawn.some(m => m.deck === 'major' && m.filename === f))
        const availableMinors = minors.filter(f => !drawn.some(m => m.deck === 'minor' && m.filename === f))
        
        const pool: ({deck:'major'|'minor', filename:string})[] = []
        availableMajors.forEach(f=> pool.push({deck:'major', filename:f}))
        availableMinors.forEach(f=> pool.push({deck:'minor', filename:f}))
        
        if (!pool.length) return alert('Nessun Arcano rimasto disponibile per la stesura mista')
        chosen = pool[Math.floor(Math.random()*pool.length)]
      }
      if (!chosen) return;
      // record draw
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'record-draw', deck: chosen.deck==='major' ? 'major' : 'minor', filename: chosen.filename, mixed: deck==='mixed' }) })
      if (!res.ok){ const json = await res.json().catch(()=>({error:'Errore'})); return alert(json.error || 'Errore') }
      const r = await fetch(`/api/sessions/${sessionId}`)
      setState(await r.json())
    } catch(e){ console.error(e); alert('Errore during draw') }
  }

  async function reset(deck?: 'majors'|'minors'|'mixed'){
    try {
      if (!deck) {
        await fetch(`/api/sessions/${sessionId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'reset' }) })
      } else if (deck === 'majors') {
        await fetch(`/api/sessions/${sessionId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'reset-draws', deck: 'major' }) })
      } else if (deck === 'minors') {
        await fetch(`/api/sessions/${sessionId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'reset-draws', deck: 'minor' }) })
      } else if (deck === 'mixed') {
        await fetch(`/api/sessions/${sessionId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'reset-draws', deck: 'mixed' }) })
      }
      const r = await fetch(`/api/sessions/${sessionId}`)
      setState(await r.json())
    } catch(e){ console.error(e); alert('Errore during reset') }
  }

  return (
    <div className="app">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 id="sessione">Sessione: {sessionId}</h2>
        <div>
        <button className="button" onClick={()=>{window.location.hash = '#/'}}>Abbandona</button>
        </div>
      </div>

      <div style={{display:'flex', gap:12, marginTop:12}}>
        <button className="button" onClick={()=>{ const el = document.querySelector('.app'); if(el) (el as HTMLElement).scrollIntoView({behavior:'smooth', block:'start'}); }}>Contesto della Stesura</button>
        <button className="button" onClick={()=>{ const el = document.getElementById('select-majors'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}>Sezione Arcani Maggiori</button>
        <button className="button" onClick={()=>{ const el = document.getElementById('select-minors'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}>Sezione Arcani Minori</button>

        <button className="button" onClick={()=>{ const el = document.getElementById('area-stesura-majors'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}>Stesura Arcani Maggiori</button>
        <button className="button" onClick={()=>{ const el = document.getElementById('area-stesura-minors'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}>Stesura Arcani Minori</button>
        <button className="button" onClick={()=>{ const el = document.getElementById('select-mixed'); if(el) el.scrollIntoView({behavior:'smooth', block:'start'}); }}>Stesura Arcani</button>
      </div>

      <div className="container">
        <div className="column">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{margin:0}}>Contesto della stesura</h3>
            <div>
              <button className="button" onClick={async ()=>{ await selectCard('major', null); await selectCard('minor', null); }}>Reset selezioni</button>
            </div>
          </div>

          <div className="small" style={{marginTop:0, marginBottom:8}}>E' necessario selezionare un arcano maggiore ed un arcano minore dall'elenco qui sotto</div>

          <div className="small" style={{marginTop:0, marginBottom:20}}>Utilizzando i bottoni "Sezione Arcani Maggiori" e "Sezione Arcani Minori" per accedere alle aree di selezione</div>

          <div className="selected-pair" style={{marginBottom:12}}>
            <div>
              {state?.selectedMajor ? (
                  <img className="selected-card" src={`/resource/arcani-maggiori/${state.selectedMajor}`} alt={state.selectedMajor} />
              ) : (
                <div className="placeholder-card">Nessun Arcano Maggiore</div>
              )}
            </div>

            <div>
              {state?.selectedMinor ? (
                <img className="selected-card" src={`/resource/arcani-minori/${state.selectedMinor}`} alt={state.selectedMinor} />
              ) : (
                <div className="placeholder-card">Nessun Arcano Minore</div>
              )}
            </div>

          </div>

          <h4 id="select-majors">Arcani Maggiori (seleziona)</h4>
          <div className="row">
            {majors.map(f => (
              <img key={f} className={state?.selectedMajor===f? 'thumb selected':'thumb'} src={`/resource/arcani-maggiori/${f}`} alt={f} onClick={()=>selectCard('major', f)} />
            ))}
          </div>

          <h4 id="select-minors" style={{marginTop:16}}>Arcani Minori (seleziona)</h4>
          <div className="row">
            {minors.map(f => (
              <img key={f} className={state?.selectedMinor===f? 'thumb selected':'thumb'} src={`/resource/arcani-minori/${f}`} alt={f} onClick={()=>selectCard('minor', f)} />
            ))}
          </div>
        </div>

        <div className="column">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
            <h3 id="area-stesura-majors" style={{margin:0}}>Stesura Arcani Maggiori</h3>
            <div className="small" style={{textAlign:'right'}}>Stesure: {(state?.majorDraws||[]).length}/10</div>
          </div>

          <div className="small" style={{marginTop:0, marginBottom:12}}>E' possibile procedere con una stesura; in questa sezione i tarocchi saranno selezionati solo dal deck degli arcani maggiori. Utilizzando il bottone "Stesura Casuale" sarà selezionato randomicamente un tarocco</div>

          <div style={{marginTop:4, marginBottom:20}}>
            <button className="button" onClick={()=>draw('arcani-maggiori')} disabled={(state?.majorDraws||[]).length>=10}>Stesura casuale</button>
            <button className="button" onClick={()=>reset('majors')} style={{marginLeft:8}}>Reset stesure</button>
          </div>
          <div className="row">
            {state?.majorDraws.map((f,i)=> (
              <img key={i} className="thumb" src={`/resource/arcani-maggiori/${f}`} alt={f} />
            ))}          </div>
        </div>

        <div className="column">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
            <h3 id="area-stesura-minors" style={{margin:0}}>Stesura Arcani Minori</h3>
            <div className="small" style={{textAlign:'right'}}>Stesure: {(state?.minorDraws||[]).length}/10</div>
          </div>

          <div className="small" style={{marginTop:0, marginBottom:12}}>E' possibile procedere con una stesura; in questa sezione i tarocchi saranno selezionati solo dal deck degli arcani minori. Utilizzando il bottone "Stesura Casuale" sarà selezionato randomicamente un tarocco</div>

          <div style={{marginTop:4, marginBottom:20}}>
            <button className="button" onClick={()=>draw('arcani-minori')} disabled={(state?.minorDraws||[]).length>=10}>Stesura casuale</button>
            <button className="button" onClick={()=>reset('minors')} style={{marginLeft:8}}>Reset stesure</button>
          </div>
          <div className="row">
            {state?.minorDraws.map((f,i)=> (
              <img key={i} className="thumb" src={`/resource/arcani-minori/${f}`} alt={f} />
            ))}
          </div>
        </div>

        <div className="section-anchor" id="select-mixed"></div>
        <div className="column">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
            <h3 id="area-stesura-mixed" style={{margin:0}}>Stesura Arcani Maggiori e Minori</h3>
            <div className="small" style={{textAlign:'right'}}>Stesure: {(state?.mixedDraws||[]).length}/10</div>
          </div>

          <div className="small" style={{marginTop:0, marginBottom:12}}>E' possibile procedere con una stesura; in questa sezione i tarocchi saranno selezionati solo dal deck degli arcani maggiori e minori. Utilizzando il bottone "Stesura Casuale" sarà selezionato randomicamente un tarocco</div>

          <div style={{marginTop:4, marginBottom:20}}>
            <button className="button" onClick={()=>draw('mixed')} disabled={((state?.mixedDraws||[]).length)>=10}>Stesura casuale</button>
            <button className="button" onClick={()=>reset('mixed')} style={{marginLeft:8}}>Reset stesure</button>
          </div>
          <div className="row">
            {state?.mixedDraws.map((item,i)=> (
              <img key={i} className="thumb" src={`/resource/${item.deck==='major' ? 'arcani-maggiori' : 'arcani-minori'}/${item.filename}`} alt={item.filename} />
            ))}          </div>
        </div>
      </div>
    </div>
  )
}
