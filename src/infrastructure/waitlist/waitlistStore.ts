import { getSupabaseServerClient } from '@/infrastructure/storage/supabase/server';

export type WaitlistEntry = {
  id: string;
  email: string;
  audit_id: string;
  unlock_id: string;
  page_type?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
};

export type SaveWaitlistParams = {
  email: string;
  auditId: string;
  pageType?: string;
  ipAddress?: string;
  userAgent?: string;
};

/**
 * Save a new waitlist entry to Supabase
 * Returns existing unlock_id if email + audit_id combination already exists
 */
export const saveWaitlistEntry = async (params: SaveWaitlistParams) => {
  const supabase = getSupabaseServerClient();
  const normalizedEmail = params.email.trim().toLowerCase();

  try {
    // Check if entry already exists for this email + audit combination
    const { data: existing, error: selectError } = await supabase
      .from('waitlist')
      .select('unlock_id')
      .eq('email', normalizedEmail)
      .eq('audit_id', params.auditId)
      .single();

    // If exists, return the existing unlock_id
    if (existing && !selectError) {
      return { status: 'exists' as const, unlockId: existing.unlock_id };
    }

    // Create new entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: normalizedEmail,
        audit_id: params.auditId,
        page_type: params.pageType || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null
      })
      .select('unlock_id')
      .single();

    if (error) {
      // Handle unique constraint violation (23505)
      if (error.code === '23505') {
        // Race condition: entry was created between our check and insert
        // Fetch the unlock_id again
        const { data: raceData } = await supabase
          .from('waitlist')
          .select('unlock_id')
          .eq('email', normalizedEmail)
          .eq('audit_id', params.auditId)
          .single();

        if (raceData) {
          return { status: 'exists' as const, unlockId: raceData.unlock_id };
        }
      }
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return { status: 'created' as const, unlockId: data.unlock_id };
  } catch (error) {
    console.error('Error saving waitlist entry:', error);
    throw error;
  }
};

/**
 * Verify if an unlock_id is valid for a specific audit
 */
export const verifyUnlock = async (params: { auditId: string; unlockId: string }) => {
  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .eq('audit_id', params.auditId)
      .eq('unlock_id', params.unlockId)
      .single();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

/**
 * Check if an unlock_id exists (regardless of audit)
 */
export const isValidUnlockId = async (unlockId: string) => {
  const supabase = getSupabaseServerClient();

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .eq('unlock_id', unlockId)
      .single();

    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
};

/**
 * Get all waitlist entries (for admin dashboard)
 */
export const getAllWaitlistEntries = async (options?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}) => {
  const supabase = getSupabaseServerClient();
  const limit = options?.limit || 100;
  const offset = options?.offset || 0;
  const orderBy = options?.orderBy || 'created_at';
  const ascending = options?.ascending ?? false;

  try {
    const { data, error, count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      success: true,
      data: data as WaitlistEntry[],
      total: count || 0
    };
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get waitlist statistics
 */
export const getWaitlistStats = async () => {
  const supabase = getSupabaseServerClient();

  try {
    // Get total count
    const { count: total, error: totalError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get today's count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayCount, error: todayError } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (todayError) throw todayError;

    // Get unique emails count
    const { data: uniqueData, error: uniqueError } = await supabase
      .from('waitlist')
      .select('email');

    if (uniqueError) throw uniqueError;

    const uniqueEmails = new Set(uniqueData?.map(entry => entry.email)).size;

    return {
      success: true,
      total: total || 0,
      today: todayCount || 0,
      uniqueEmails: uniqueEmails
    };
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return {
      success: false,
      total: 0,
      today: 0,
      uniqueEmails: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
