import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { clientEnv } from '@/infrastructure/env/client';

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = clientEnv;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client environment is not configured.');
  }

  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserClient;
}
