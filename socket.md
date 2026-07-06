Sei un senior full-stack engineer incaricato di rifattorizzare completamente il repository ColleVento.

Obiettivo:
portare il progetto ad una sola architettura coerente e rimuovere tutte le parti duplicate o obsolete.

L'architettura finale obbligatoria deve essere:

FRONTEND:
- Vite
- React
- TypeScript
- Deploy su Vercel

BACKEND:
- Vercel Serverless Functions
- nessun server Node persistente
- nessun Express server

DATABASE/STORAGE:
- Redis come unica fonte persistente dello stato delle sessioni

REALTIME:
- Supabase Realtime Broadcast
- nessun Socket.IO
- nessun WebSocket custom

---

# FASE 1 - ANALISI COMPLETA

Prima di modificare qualsiasi file:

Analizza tutto il repository.

Individua:

- tutte le API backend
- tutte le route
- tutti i client realtime
- tutte le dipendenze inutilizzate
- tutti i file duplicati
- tutte le implementazioni parallele della gestione sessione

Genera un report:

FILE | SCOPO | TENERE/CANCELLARE/MODIFICARE | MOTIVO

Non modificare ancora il codice.

---

# FASE 2 - RIMUOVERE SOCKET.IO

Elimina completamente qualsiasi implementazione Socket.IO.

Cerca:

- socket.io
- socket.io-client
- IOServer
- new Server()
- io.on('connection')
- socket.join
- socket.emit
- socket.on
- session_update
- join_session
- leave_session

Da eliminare:

- server/src/index.ts
- eventuali server Express
- eventuali websocket server
- eventuali adapter Redis Socket.IO
- eventuali configurazioni websocket

Se una dipendenza è usata solo per Socket.IO:

rimuoverla da package.json.

Eseguire pulizia:

npm uninstall socket.io socket.io-client

(se presenti)

---

# FASE 3 - ELIMINARE DOPPIA GESTIONE SESSIONI

Attualmente esistono due sistemi:

1) Express + Map in memoria:

sessions = new Map()

2) Vercel Functions + Redis

Devono rimanere SOLO:

Vercel Functions + Redis.

Eliminare completamente:

- Map delle sessioni
- stato in memoria
- server stateful
- codice che usa sessions.get()
- codice che usa sessions.set()

La fonte unica deve essere:

Redis.

---

# FASE 4 - STRUTTURA BACKEND FINALE

La struttura deve essere simile:

api/
 |
 ├── sessions/
 │     ├── index.ts
 │     └── [id].ts
 |
 ├── _redis.ts
 |
 └── _realtime.ts


Creare:

api/_realtime.ts


Questo file deve contenere la configurazione Supabase Realtime.

Responsabilità:

- creare client Supabase server
- pubblicare eventi broadcast
- nascondere la logica realtime alle API


---

# FASE 5 - IMPLEMENTARE REALTIME

Ogni modifica ad una sessione deve fare:

1.
leggere stato da Redis

2.
modificare stato

3.
salvare stato aggiornato su Redis

4.
pubblicare evento realtime


Esempio:

POST /api/sessions/:id


Flusso:

Redis GET

↓

update state

↓

Redis SET

↓

Supabase Broadcast:

channel:
session:{id}


evento:

session_update


payload:

{
 sessionId: id,
 state: updatedState
}


---

# FASE 6 - CLIENT REACT

Eliminare completamente:

- socket.io-client
- useEffect socket
- join_session
- leave_session
- session_update da Socket.IO


Creare invece un hook:

client/src/hooks/useSessionRealtime.ts


Responsabilità:

- collegarsi al canale Supabase:

session:${sessionId}


- ascoltare:

session_update


- quando arriva:

aggiornare lo stato React


Esempio concettuale:


useSessionRealtime(sessionId, setState)


---

# FASE 7 - STATO REACT

La sessione deve avere un unico flusso:

Caricamento iniziale:

GET /api/sessions/:id

↓

setState


Aggiornamenti:

Supabase Realtime

↓

setState


Non fare:

POST

↓

GET immediato


perché il realtime sostituisce questa sincronizzazione.

---

# FASE 8 - VARIABILI AMBIENTE

Creare documentazione completa delle variabili richieste:


Vercel:

REDIS_URL

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY


Client:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY


Indicare quali sono pubbliche e quali private.


---

# FASE 9 - TEST FUNZIONALE

Dopo la modifica verificare:

Scenario:

Giocatore A apre:

sessione X


Giocatore B apre:

sessione X


Test:

A pesca una carta

Risultato atteso:

- Redis aggiornato
- evento broadcast inviato
- B riceve evento
- UI di B aggiornata senza refresh


Testare:

- select carta
- draw carta
- reset
- reset singolo mazzo
- ingresso nuovo giocatore


---

# FASE 10 - OUTPUT FINALE

Alla fine restituisci:

1.
Lista file eliminati

2.
Lista file creati

3.
Lista file modificati

4.
Dipendenze npm rimosse

5.
Dipendenze npm aggiunte

6.
Nuova architettura descritta

7.
Eventuali problemi rimasti


IMPORTANTE:

Non mantenere codice morto per compatibilità.

Il repository deve terminare con UNA SOLA architettura:

React + Vite
+
Vercel Functions
+
Redis
+
Supabase Realtime

Nessun Express.
Nessun Socket.IO.
Nessuna Map in memoria.
Nessuna doppia gestione delle sessioni.