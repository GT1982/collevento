Deployment su Vercel - passi rapidi

Scelta: Client + server su Vercel (serverless) usando Vercel KV per le sessioni.

Passaggi locali (preparazione):
1. Genera manifest delle immagini (crea client/public/resource/manifest.json):
   node scripts/generate-manifest.js
   - Questo copia solo il manifest; assicurati che la cartella `resource/arcani-maggiori` e `resource/arcani-minori` siano nella root del repo.
   - Puoi anche spostare fisicamente le immagini in client/public/resource/arcani-maggiori e .../arcani-minori per distribuirle con il sito statico.

2. Test locale:
   cd client
   npm run dev
   (client ora carica /resource/manifest.json e le immagini da /resource/...)
   Le chiamate API puntano a /api/sessions/* (funzioni serverless)

3. Configurazione Vercel:
   - Crea un progetto su Vercel e collega il repository.
   - Aggiungi le variabili d'ambiente per Vercel KV (seguire la doc @vercel/kv): crea namespace e incolla le variabili fornite da Vercel.
   - Deploy: Vercel rileverà il client (Vite) e pubblicherà il sito. Le funzioni in /api saranno distribuite come serverless.

Note tecniche importanti:
- Le funzioni API usano @vercel/kv. Se non configuri KV, il fallback non persisterà.
- Le immagini devono essere disponibili in client/public/resource/* quando deployi (Vercel serve la cartella public come static assets).

Vuoi che esegua:
- generazione manifest ora e testi locali,
- oppure proceda al commit delle modifiche e ti mostri come fare deploy su Vercel (consigliato)?
