import { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
function createSession(){
  return { id: randomUUID() };
}
import { kv } from '@vercel/kv';

const KV_PREFIX = 'session:';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = await createSession();
  const state = {
    id,
    selectedMajor: null,
    selectedMinor: null,
    majorDraws: [] as string[],
    minorDraws: [] as string[],
    mixedDraws: [] as any[],
  };
  try {
    await kv.set(KV_PREFIX + id, JSON.stringify(state));
    return res.json(state);
  } catch (e) {
    // fallback: return state but warn that KV not configured
    return res.json({ ...state, _warning: 'KV not configured; session will not persist' });
  }
}
