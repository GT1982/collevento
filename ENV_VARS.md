# Variabili d'Ambiente

Per far funzionare il progetto con la nuova architettura Vercel + Redis + Supabase Realtime, è necessario configurare le seguenti variabili d'ambiente.

## Lato Server (Vercel)
Queste variabili devono essere configurate nella dashboard del progetto Vercel (o in `.env.local` per lo sviluppo locale usando `vercel dev`). **ATTENZIONE: Queste variabili sono PRIVATE e non devono mai essere inviate al client.**

- `collevento_REDIS_URL`: URL di connessione al database Redis (es. Upstash, Redis Cloud).
- `collevento_SUPABASE_URL`: URL del progetto Supabase (es. `https://xxxx.supabase.co`).
- `collevento_SUPABASE_SERVICE_ROLE_KEY`: Chiave segreta di Supabase con privilegi elevati (Service Role Key). Viene usata dal backend (Vercel Functions) per autenticarsi ed emettere in modo sicuro gli eventi di broadcast bypassando le Row Level Security.

## Lato Client (Vite)
Queste variabili devono essere inserite in un file `.env` nella root del client (`client/.env`) o configurate in Vercel tra le variabili d'ambiente. Grazie al prefisso `VITE_`, Vite le renderà pubbliche e disponibili nel codice client. **ATTENZIONE: Queste variabili sono PUBBLICHE.**

- `VITE_SUPABASE_URL`: L'URL pubblico del progetto Supabase (lo stesso usato lato server).
- `VITE_SUPABASE_ANON_KEY`: La chiave anonima (Anon Key) del progetto Supabase. È sicura da esporre pubblicamente ed è necessaria affinché i client possano iscriversi ai canali Realtime e mettersi in ascolto degli aggiornamenti (read-only).
