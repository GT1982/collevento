import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.collevento_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// On the server we prefer the service role key if available, otherwise fallback to anon key
const supabaseKey = process.env.collevento_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase URL or Key is missing from environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function broadcastSessionUpdate(sessionId: string, state: any) {
  if (!supabaseUrl || !supabaseKey) return;
  
  const channel = supabase.channel(`session:${sessionId}`);
  return channel.send({
    type: 'broadcast',
    event: 'session_update',
    payload: { sessionId, state }
  });
}
