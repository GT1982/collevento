import { VercelRequest, VercelResponse } from '@vercel/node';
import getRedis from '../../_redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  // Set the headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send an initial connected message
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  try {
    const client = await getRedis();
    // We need a duplicate client specifically for subscribing, 
    // because once a client subscribes, it cannot send regular commands.
    const subscriber = client.duplicate();
    await subscriber.connect();

    const channel = `session:${id}`;

    await subscriber.subscribe(channel, (message) => {
      // Send the incoming Redis pub/sub message via SSE
      res.write(`data: ${message}\n\n`);
    });

    // Cleanup when the connection is closed
    req.on('close', async () => {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
    });

  } catch (error) {
    console.error('Errore durante stream SSE:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: 'Redis subscription failed' })}\n\n`);
    res.end();
  }
}
