import { useEffect } from 'react';

export function useSessionRealtime(sessionId: string, setState: React.Dispatch<React.SetStateAction<any>>) {
  useEffect(() => {
    if (!sessionId) return;

    // Use EventSource to connect to our Server-Sent Events endpoint
    const eventSource = new EventSource(`/api/sessions/${sessionId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'session_update' && payload.state) {
          setState(payload.state);
        }
      } catch (e) {
        console.error('Errore nel parsing del messaggio SSE:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Errore di connessione SSE. EventSource tenterà di riconnettersi automaticamente.', error);
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId, setState]);
}
