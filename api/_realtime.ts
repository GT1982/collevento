import getRedis from './_redis';

export async function publishSessionUpdate(sessionId: string, state: any) {
  try {
    const client = await getRedis();
    const payload = JSON.stringify({
      type: 'session_update',
      sessionId,
      state
    });
    await client.publish(`session:${sessionId}`, payload);
  } catch (error) {
    console.error('Errore durante la pubblicazione Redis:', error);
  }
}
