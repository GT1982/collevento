import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export function useSessionRealtime(sessionId: string, setState: React.Dispatch<React.SetStateAction<any>>) {
  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase non inizializzato: mancano VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
      return;
    }

    const channel = supabase.channel(`session:${sessionId}`);

    channel
      .on('broadcast', { event: 'session_update' }, (payload) => {
        if (payload.payload && payload.payload.state) {
          setState(payload.payload.state);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, setState]);
}
