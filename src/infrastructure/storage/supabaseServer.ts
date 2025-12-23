import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from '@/shared/config/env';

export const supabaseServer = createClient(
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
