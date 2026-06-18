import { VercelRequest, VercelResponse } from '@vercel/node';
import getRedis from '../_redis';

const REDIS_PREFIX = 'redis-sky-anchor:'; // namespace for this app's keys

async function createSession(){
  // simple unique id generation; could also use an INCR key in Redis if desired
  const id = `${Date.now()}-${Math.floor(Math.random()*100000)}`;
  return { id };
}

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
    const client = await getRedis();
    await client.set(`${REDIS_PREFIX}${id}`, JSON.stringify(state));
    return res.json(state);
  } catch (e) {
    console.error('Redis set error', e);
    return res.status(500).json({ error: 'Redis error' });
  }
}
