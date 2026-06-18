import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, RedisClientType } from 'redis';

const REDIS_DB_PREFIX = 'redis-sky-anchor:'; // namespace for the requested Redis DB
let redisClient: RedisClientType | null = null;

async function getRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) return redisClient;
  const url = process.env.REDIS_URL;
  redisClient = createClient({ url });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  return redisClient;
}

async function createSession(){
  const client = await getRedis();
  // use Redis INCR to get unique ids or fallback to randomUUID if not available
  const id = String(Date.now()) + '-' + Math.floor(Math.random()*10000);
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
    await client.set(REDIS_DB_PREFIX + id, JSON.stringify(state));
    return res.json(state);
  } catch (e) {
    console.error('Redis set error', e);
    return res.status(500).json({ error: 'Redis error' });
  }
}
