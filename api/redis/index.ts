import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, RedisClientType } from 'redis';

// Singleton Redis client to avoid reconnecting on every invocation
let redisClient: RedisClientType | null = null;

async function getRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) return redisClient;
  const url = process.env.REDIS_URL || undefined;
  redisClient = createClient({ url });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  return redisClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const client = await getRedis();

    if (req.method === 'POST') {
      const { key, value } = req.body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      // Store value as JSON string
      await client.set(String(key), JSON.stringify(value ?? null));
      return res.json({ ok: true });
    }

    if (req.method === 'GET') {
      const key = (req.query.key as string) || (req.query.k as string);
      if (!key) return res.status(400).json({ error: 'Missing key query param' });
      const raw = await client.get(String(key));
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        return res.json({ result: parsed });
      } catch (e) {
        return res.json({ result: raw });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Redis handler error', e);
    return res.status(500).json({ error: e?.message || String(e) });
  }
}
