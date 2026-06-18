import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

const KV_PREFIX = 'session:';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const key = KV_PREFIX + id;

  if (req.method === 'GET') {
    try {
      const raw = await kv.get(key) as string | null;
      if (!raw) return res.status(404).json({ error: 'Session not found' });
      return res.json(JSON.parse(raw));
    } catch (e) {
      return res.status(500).json({ error: 'KV error' });
    }
  }

  if (req.method === 'POST') {
    const { action } = req.body || {};
    try {
      const raw = await kv.get(key) as string | null;
      if (!raw) return res.status(404).json({ error: 'Session not found' });
      const state = JSON.parse(raw);

      if (action === 'select') {
        const { deck, filename } = req.body;
        if (deck === 'major') state.selectedMajor = filename ?? null;
        else state.selectedMinor = filename ?? null;
      } else if (action === 'record-draw') {
        const { deck, filename, mixed } = req.body;
        if (mixed) {
          state.mixedDraws = state.mixedDraws || [];
          if ((state.mixedDraws.length||0) >= 10) return res.status(400).json({ error: 'Limit 10 reached' });
          const deckType = deck === 'major' ? 'major' : 'minor';
          if (state.mixedDraws.some((d: any) => d.deck === deckType && d.filename === filename)) {
            return res.status(400).json({ error: 'Card already drawn' });
          }
          state.mixedDraws.push({ deck: deckType, filename });
        } else if (deck === 'major') {
          state.majorDraws = state.majorDraws || [];
          if ((state.majorDraws.length||0) >= 10) return res.status(400).json({ error: 'Limit 10 reached' });
          if (state.majorDraws.includes(filename)) return res.status(400).json({ error: 'Card already drawn' });
          state.majorDraws.push(filename);
        } else {
          state.minorDraws = state.minorDraws || [];
          if ((state.minorDraws.length||0) >= 10) return res.status(400).json({ error: 'Limit 10 reached' });
          if (state.minorDraws.includes(filename)) return res.status(400).json({ error: 'Card already drawn' });
          state.minorDraws.push(filename);
        }
      } else if (action === 'reset') {
        state.majorDraws = [];
        state.minorDraws = [];
        state.selectedMajor = null;
        state.selectedMinor = null;
        state.mixedDraws = [];
      } else if (action === 'reset-draws') {
        const { deck } = req.body || {};
        if (deck === 'major') {
          state.majorDraws = [];
        } else if (deck === 'minor') {
          state.minorDraws = [];
        } else if (deck === 'mixed') {
          state.mixedDraws = [];
        } else {
          state.majorDraws = [];
          state.minorDraws = [];
          state.mixedDraws = [];
        }
      } else {
        return res.status(400).json({ error: 'Unknown action' });
      }

      await kv.set(key, JSON.stringify(state));
      return res.json(state);
    } catch (e) {
      return res.status(500).json({ error: 'KV error or malformed state' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
