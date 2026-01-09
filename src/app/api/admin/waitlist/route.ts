import { jsonResponse } from '@/shared/utils/response';
import { getAllWaitlistEntries, getWaitlistStats } from '@/infrastructure/waitlist/waitlistStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/waitlist
 * Fetch waitlist entries with pagination and stats
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Handle stats request
    if (action === 'stats') {
      const stats = await getWaitlistStats();

      if (!stats.success) {
        return jsonResponse(
          {
            status: 'error',
            message: stats.error || 'Failed to fetch stats'
          },
          { status: 500 }
        );
      }

      return jsonResponse(
        {
          status: 'success',
          message: 'Stats retrieved successfully',
          data: {
            total: stats.total,
            today: stats.today,
            uniqueEmails: stats.uniqueEmails
          }
        },
        { status: 200 }
      );
    }

    // Handle entries request
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const orderBy = url.searchParams.get('orderBy') || 'created_at';
    const ascending = url.searchParams.get('ascending') === 'true';

    const result = await getAllWaitlistEntries({
      limit,
      offset,
      orderBy,
      ascending
    });

    if (!result.success) {
      return jsonResponse(
        {
          status: 'error',
          message: result.error || 'Failed to fetch waitlist entries'
        },
        { status: 500 }
      );
    }

    return jsonResponse(
      {
        status: 'success',
        message: 'Entries retrieved successfully',
        data: {
          entries: result.data,
          total: result.total,
          limit,
          offset
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin waitlist API error:', error);
    return jsonResponse(
      {
        status: 'error',
        message: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
