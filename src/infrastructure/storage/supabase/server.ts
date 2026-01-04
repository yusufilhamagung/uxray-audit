import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverEnv } from '@/infrastructure/env/server';

let serverClient: SupabaseClient | null = null;

const resolveServerConfig = () => {
  const url =
    process.env.SUPABASE_URL ||
    serverEnv.supabaseUrl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || serverEnv.supabaseServiceRoleKey || '';
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    serverEnv.supabaseAnonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return {
    url,
    key: serviceRoleKey || anonKey
  };
};

export function getSupabaseServerClient() {
  const { url, key } = resolveServerConfig();
  if (!url || !key) {
    throw new Error('Supabase server environment is not configured.');
  }

  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return serverClient;
}
