import { jsonResponse } from '@/shared/utils/response';
import { getSupabaseServerClient } from '@/infrastructure/storage/supabase/server';
import { serverEnv } from '@/infrastructure/env/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverEnv.isSupabaseConfigured) {
    return jsonResponse(
      { status: 'error', message: 'Supabase is not configured.' },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from('early_access_signups')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return jsonResponse({
      status: 'success',
      message: 'OK',
      data: { count: count ?? 0 }
    });
  } catch (error) {
    console.error('Early access count failed:', error);
    return jsonResponse(
      { status: 'error', message: 'Failed to load signup count.' },
      { status: 500 }
    );
  }
}
