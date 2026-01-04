import { clientEnv } from '@/infrastructure/env/client';
import { getSupabaseBrowserClient } from '@/infrastructure/storage/supabase/browser';

export function getBrandLogoUrl() {
  const { supabaseUrl, supabaseAnonKey, supabaseStorageBucket, brandLogoPath } = clientEnv;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseStorageBucket || !brandLogoPath) {
    return null;
  }

  try {
    // Use Supabase storage public URL so the logo loads without extra API calls.
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.storage.from(supabaseStorageBucket).getPublicUrl(brandLogoPath);
    return data.publicUrl;
  } catch (error) {
    console.warn('Failed to resolve brand logo URL from Supabase.', error);
    return null;
  }
}
