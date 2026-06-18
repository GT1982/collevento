import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { Server as IOServer } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

const RESOURCE_ROOT = path.resolve(__dirname, '../../resource');
const MAJOR_DIR = path.join(RESOURCE_ROOT, 'arcani-maggiori');
const MINOR_DIR = path.join(RESOURCE_ROOT, 'arcani-minori');

app.use('/images', express.static(RESOURCE_ROOT));

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f));
}

const sessions = new Map<string, any>();

// HTTP + socket.io server
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('join_session', (id: string) => { socket.join(id); console.log(`${socket.id} joined ${id}`); });
  socket.on('leave_session', (id: string) => { socket.leave(id); console.log(`${socket.id} left ${id}`); });
});

function emitSessionUpdate(id: string){
  const s = sessions.get(id);
  if (!s) return;
  io.to(id).emit('session_update', s);
}

app.get('/cards', (req, res) => {
  const deck = req.query.deck === 'arcani-maggiori' ? 'arcani-maggiori' : 'arcani-minori';
  const dir = deck === 'arcani-maggiori' ? MAJOR_DIR : MINOR_DIR;
  res.json({ files: listFiles(dir), deck });
});

app.post('/sessions', (req, res) => {
  const id = uuidv4();
  const state = {
    id,
    selectedMajor: null,
    selectedMinor: null,
    majorDraws: [] as string[],
    minorDraws: [] as string[],
    mixedDraws: [] as {deck: string, filename: string}[],
  };
  sessions.set(id, state);
  res.json(state);
});

app.post('/sessions/:id/join', (req, res) => {
  const id = req.params.id;
  if (!sessions.has(id)) return res.status(404).json({ error: 'Sessione non trovata' });
  res.json(sessions.get(id));
});

app.get('/sessions/:id', (req, res) => {
  const id = req.params.id;
  const s = sessions.get(id);
  if (!s) return res.status(404).json({ error: 'Sessione non trovata' });
  res.json(s);
});

app.post('/sessions/:id/select', (req, res) => {
  const id = req.params.id;
  const s = sessions.get(id);
  if (!s) return res.status(404).json({ error: 'Sessione non trovata' });
  const { deck, filename } = req.body;
  if (deck === 'major') s.selectedMajor = filename;
  else s.selectedMinor = filename;
  sessions.set(id, s);
  emitSessionUpdate(id);
  res.json(s);
});

app.post('/sessions/:id/draw', (req, res) => {
  const id = req.params.id;
  const s = sessions.get(id);
  if (!s) return res.status(404).json({ error: 'Sessione non trovata' });
  const rawDeck = String(req.body.deck || '').toLowerCase();

  if (rawDeck === 'mixed' || rawDeck === 'misto'){
    // enforce mixed limit of 10
    if ((s.mixedDraws || []).length >= 10) return res.status(400).json({ error: 'Limite 10 raggiunto' });
    // determine availability for both decks, independent from major/minor draws
    const majorFiles = listFiles(MAJOR_DIR).filter(f => !(s.mixedDraws || []).some(m => m.filename === f));
    const minorFiles = listFiles(MINOR_DIR).filter(f => !(s.mixedDraws || []).some(m => m.filename === f));
    const majorAvailable = majorFiles.length > 0;
    const minorAvailable = minorFiles.length > 0;
    if (!majorAvailable && !minorAvailable) return res.status(400).json({ error: 'Nessuna carta disponibile in entrambi i mazzi' });
    // choose deck randomly among available ones
    let chosenDeck: 'major'|'minor';
    if (majorAvailable && minorAvailable){
      chosenDeck = Math.random() < 0.5 ? 'major' : 'minor';
    } else if (majorAvailable) chosenDeck = 'major';
    else chosenDeck = 'minor';

    const files = chosenDeck === 'major' ? majorFiles : minorFiles;
    const rand = files[Math.floor(Math.random() * files.length)];
    // record only in mixedDraws to keep areas independent
    s.mixedDraws.push({deck: chosenDeck, filename: rand});
    sessions.set(id, s);
    emitSessionUpdate(id);
    return res.json({ filename: rand, deck: chosenDeck, draws: s.mixedDraws });
  }

  const isMajor = rawDeck === 'major' || rawDeck === 'arcani-maggiori' || rawDeck.includes('maggiori');
  const dir = isMajor ? MAJOR_DIR : MINOR_DIR;
  const files = listFiles(dir);
  if (files.length === 0) return res.status(400).json({ error: 'Deck vuoto' });
  const draws = isMajor ? s.majorDraws : s.minorDraws;
  if (draws.length >= 10) return res.status(400).json({ error: 'Limite 10 raggiunto' });
  const available = files.filter(f => !draws.includes(f));
  if (available.length === 0) return res.status(400).json({ error: 'Nessuna carta disponibile' });
  const rand = available[Math.floor(Math.random() * available.length)];
  draws.push(rand);
  sessions.set(id, s);
  emitSessionUpdate(id);
  res.json({ filename: rand, draws });
});

app.post('/sessions/:id/reset', (req, res) => {
  const id = req.params.id;
  const s = sessions.get(id);
  if (!s) return res.status(404).json({ error: 'Sessione non trovata' });

  // Allow resetting a specific area by providing { deck: 'majors'|'minors'|'mixed' } in the body
  const deckRaw = (req.body && req.body.deck) || req.query.deck;
  if (!deckRaw) {
    // default: reset all
    s.majorDraws = [];
    s.minorDraws = [];
    s.mixedDraws = [];
  } else {
    const d = String(deckRaw).toLowerCase();
    if (d === 'major' || d === 'majors' || d === 'arcani-maggiori') s.majorDraws = [];
    else if (d === 'minor' || d === 'minors' || d === 'arcani-minori') s.minorDraws = [];
    else if (d === 'mixed' || d === 'misto' || d === 'arcani-misti') s.mixedDraws = [];
    else {
      return res.status(400).json({ error: 'Deck non riconosciuto' });
    }
  }

  sessions.set(id, s);
  emitSessionUpdate(id);
  res.json(s);
});

// Provide compatibility for client which calls /api/* when running with Vite proxy
// This will strip the /api prefix and forward to the existing handlers above (e.g. /sessions)
app.use('/api', (req, res, next) => {
  // remove /api prefix
  req.url = req.url.replace(/^\/api/, '') || '/';
  app._router.handle(req, res, next);
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => console.log(`Server listening on ${port}`));
