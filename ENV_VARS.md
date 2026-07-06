# Variabili d'Ambiente

Per far funzionare il progetto con l'architettura Vercel + Redis, è necessario configurare la seguente variabile d'ambiente.

## Lato Server (Vercel)
Questa variabile deve essere configurata nella dashboard del progetto Vercel (o in `.env.local` per lo sviluppo locale usando `vercel dev`). **ATTENZIONE: Questa variabile è PRIVATA e non deve mai essere esposta al client.**

- `collevento_REDIS_URL`: URL di connessione al database Redis (es. Upstash, Redis Cloud). Viene utilizzato sia per lo storage dello stato, sia per la pubblicazione/sottoscrizione degli eventi realtime tramite l'endpoint SSE.

## Lato Client (Vite)
Attualmente non sono richieste variabili d'ambiente lato client, in quanto l'hook realtime punta direttamente all'API dello stesso dominio (`/api/sessions/[id]/stream`).
