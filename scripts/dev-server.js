const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'client', 'dist');
const PORT = process.env.PORT || 3000;

const sessions = new Map(); // id -> state
const subscribers = new Map(); // id -> Set<res>

function jsonResponse(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function notify(sessionId, state) {
  const set = subscribers.get(sessionId);
  if (!set) return;
  const payload = JSON.stringify({ type: 'session_update', state });
  for (const res of set) {
    try { res.write(`data: ${payload}\n\n`); } catch (e) { /* ignore */ }
  }
}

function createSession() {
  const id = `${Date.now()}-${Math.floor(Math.random()*100000)}`;
  const state = {
    id,
    selectedMajor: null,
    selectedMinor: null,
    majorDraws: [],
    minorDraws: [],
    mixedDraws: [],
  };
  sessions.set(id, state);
  return state;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    // API routes
    if (pathname === '/api/sessions' && req.method === 'POST') {
      const state = createSession();
      jsonResponse(res, 200, state);
      return;
    }

    const sessMatch = pathname.match(/^\/api\/sessions\/(.+?)(?:\/stream)?$/);
    if (sessMatch) {
      const id = sessMatch[1];
      if (pathname.endsWith('/stream') || req.url.endsWith('/stream')) {
        // SSE stream
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        });
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
        let set = subscribers.get(id);
        if (!set) { set = new Set(); subscribers.set(id, set); }
        set.add(res);
        req.on('close', () => {
          set.delete(res);
          if (set.size === 0) subscribers.delete(id);
        });
        return;
      }

      if (req.method === 'GET') {
        const state = sessions.get(id);
        if (!state) return jsonResponse(res, 404, { error: 'Session not found' });
        return jsonResponse(res, 200, state);
      }

      if (req.method === 'POST') {
        const body = await parseBody(req).catch(() => ({}));
        const { action } = body || {};
        const state = sessions.get(id);
        if (!state) return jsonResponse(res, 404, { error: 'Session not found' });

        if (action === 'select') {
          const { deck, filename } = body;
          if (deck === 'major') state.selectedMajor = filename ?? null;
          else state.selectedMinor = filename ?? null;
        } else if (action === 'record-draw') {
          const { deck, filename, mixed } = body;
          if (mixed) {
            state.mixedDraws = state.mixedDraws || [];
            if ((state.mixedDraws.length||0) >= 10) return jsonResponse(res, 400, { error: 'Limit 10 reached' });
            const deckType = deck === 'major' ? 'major' : 'minor';
            if (state.mixedDraws.some(d => d.deck === deckType && d.filename === filename)) return jsonResponse(res, 400, { error: 'Card already drawn' });
            state.mixedDraws.push({ deck: deckType, filename });
          } else if (deck === 'major') {
            state.majorDraws = state.majorDraws || [];
            if ((state.majorDraws.length||0) >= 10) return jsonResponse(res, 400, { error: 'Limit 10 reached' });
            if (state.majorDraws.includes(filename)) return jsonResponse(res, 400, { error: 'Card already drawn' });
            state.majorDraws.push(filename);
          } else {
            state.minorDraws = state.minorDraws || [];
            if ((state.minorDraws.length||0) >= 10) return jsonResponse(res, 400, { error: 'Limit 10 reached' });
            if (state.minorDraws.includes(filename)) return jsonResponse(res, 400, { error: 'Card already drawn' });
            state.minorDraws.push(filename);
          }
        } else if (action === 'reset') {
          state.majorDraws = [];
          state.minorDraws = [];
          state.selectedMajor = null;
          state.selectedMinor = null;
          state.mixedDraws = [];
        } else if (action === 'reset-draws') {
          const { deck } = body || {};
          if (deck === 'major') state.majorDraws = [];
          else if (deck === 'minor') state.minorDraws = [];
          else if (deck === 'mixed') state.mixedDraws = [];
          else { state.majorDraws = []; state.minorDraws = []; state.mixedDraws = []; }
        } else {
          return jsonResponse(res, 400, { error: 'Unknown action' });
        }

        sessions.set(id, state);
        notify(id, state);
        return jsonResponse(res, 200, state);
      }
    }

    // Serve static files from client/dist
    let filePath = path.join(DIST, pathname);
    if (pathname === '/' || pathname === '') filePath = path.join(DIST, 'index.html');

    if (!filePath.startsWith(DIST)) return jsonResponse(res, 403, { error: 'Forbidden' });

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const map = {
        '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp'
      };
      const ct = map[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': ct });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // fallback to index.html for SPA
    const index = path.join(DIST, 'index.html');
    if (fs.existsSync(index)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(index).pipe(res);
      return;
    }

    res.writeHead(404).end('Not found');

  } catch (err) {
    console.error('Server error', err);
    res.writeHead(500).end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
