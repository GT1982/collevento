import { createClient, RedisClientType } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var __collevento_redis: RedisClientType | undefined;
}

// Vercel production variable for Castel Vento.
// Keep the older names as fallbacks for local/legacy deployments.
const url = process.env.castelvento_REDIS_URL || process.env.REDIS_URL || process.env.COLLEVENT_REDIS_URL || process.env.collevento_REDIS_URL || process.env.collevent_REDIS_URL;

if (!url) console.warn('Warning: castelvento_REDIS_URL is not set — using in-memory fallback');

let client: RedisClientType | undefined;

if (url) {
  client = (global as any).__collevento_redis ?? createClient({ url });
  client.on('error', (err) => console.error('Redis client error', err));
} else {
  // Lightweight in-memory fallback implementing the small subset of Redis API used by the app
  const store = new Map<string, string>();
  const mock = {
    isOpen: true,
    connect: async () => {},
    on: (_: string, __?: any) => {},
    get: async (key: string) => {
      return store.has(key) ? store.get(key) as string : null;
    },
    set: async (key: string, value: string) => {
      store.set(key, value);
      return 'OK' as unknown as string;
    },
    publish: async (_channel: string, _payload: string) => {
      // No-op for publish in fallback; realtime will be best-effort
      return 0 as unknown as number;
    }
  } as unknown as RedisClientType;

  (global as any).__collevento_redis = mock;
  client = mock;
}

async function getRedis(): Promise<RedisClientType> {
  if ((global as any).__collevento_redis && (global as any).__collevento_redis.isOpen) {
    return (global as any).__collevento_redis as RedisClientType;
  }
  if (!client) throw new Error('Redis client not initialized');
  if (!client.isOpen) {
    await client.connect();
  }
  (global as any).__collevento_redis = client;
  return client;
}

export default getRedis;
