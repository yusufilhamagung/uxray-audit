import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/lib/env/server';

let serverClient: SupabaseClient | null = null;

export function getSupabaseServerClient() {
  const { supabaseUrl, supabaseServiceRoleKey } = serverEnv;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase server environment is not configured.');
  }

  if (!serverClient) {
    serverClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return serverClient;
}
