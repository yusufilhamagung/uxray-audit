import { createClient } from '@supabase/supabase-js';
import { getRequiredEnv } from './env';

export const supabaseBrowser = createClient(
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
);
