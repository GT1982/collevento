ColleVento - App per gestione sessioni di stesura carte

Struttura:
- server/: Express + TypeScript che serve API e le immagini da /images
- client/: React + TypeScript (Vite) per interfaccia utente

Avvio rapido:
1) cd server && npm install && npm run dev
2) cd client && npm install && npm run dev

Nota: assicurarsi che la cartella resource/arcani-maggiori e resource/arcani-minori esistano nella root e contengano i file .jpg/.png. Il server espone le immagini su http://localhost:3000/images/...
