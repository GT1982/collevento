import { createClient, RedisClientType } from 'redis';

declare global {
  // eslint-disable-next-line no-var
  var __collevento_redis: RedisClientType | undefined;
}

const url = process.env.collevento_REDIS_URL;
if (!url) console.warn('Warning: collevento_REDIS_URL is not set');

const client = (global as any).__collevento_redis ?? createClient({ url });
client.on('error', (err) => console.error('Redis client error', err));

async function getRedis(): Promise<RedisClientType> {
  if ((global as any).__collevento_redis && (global as any).__collevento_redis.isOpen) {
    return (global as any).__collevento_redis as RedisClientType;
  }
  if (!client.isOpen) {
    await client.connect();
  }
  (global as any).__collevento_redis = client;
  return client;
}

export default getRedis;
