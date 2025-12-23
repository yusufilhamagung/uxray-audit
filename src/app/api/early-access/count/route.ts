import { jsonResponse } from '@/lib/api/response';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverEnv.isSupabaseConfigured) {
    return jsonResponse(
      { status: 'error', message: 'Supabase belum dikonfigurasi.' },
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
      { status: 'error', message: 'Gagal memuat data early access.' },
      { status: 500 }
    );
  }
}
