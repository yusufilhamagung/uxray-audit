import { clientEnv } from '@/lib/env/client';
import { serverEnv } from '@/lib/env/server';

// Centralized environment access point. Validation happens in the underlying modules.
export const env = {
  server: serverEnv,
  client: clientEnv
};

export const envKeys = {
  client: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_BRAND_LOGO_PATH'
  ],
  server: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_STORAGE_BUCKET',
    'GEMINI_API_KEY',
    'GEMINI_URL',
    'GEMINI_MODEL',
    'AI_API_KEY',
    'AI_API_URL',
    'AI_MODEL',
    'AI_MOCK_MODE',
    'PUPPETEER_EXECUTABLE_PATH'
  ]
};
