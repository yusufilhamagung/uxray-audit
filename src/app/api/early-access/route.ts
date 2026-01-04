import { checkRateLimit } from '@/shared/utils/rate-limit';
import { EarlyAccessSchema } from '@/shared/types/early-access';
import { jsonResponse } from '@/shared/utils/response';
import { getRequestIp, getRequestUserAgent } from '@/shared/utils/request';
import { submitEarlyAccessEmail } from '@/application/usecases/submitEarlyAccessEmail';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const ip = getRequestIp();
  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return jsonResponse(
      {
        status: 'error',
        message: 'Too many requests. Try again in 1 hour.'
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = EarlyAccessSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Invalid email address.' },
      { status: 400 }
    );
  }

  try {
    const result = await submitEarlyAccessEmail(parsed.data, {
      ip: ip ?? null,
      userAgent: getRequestUserAgent() ?? null
    });

    if (result.status === 'exists') {
      return jsonResponse(
        {
          status: 'exists',
          message: 'You are already on the list.',
          data: { status: 'exists' }
        },
        { status: 200 }
      );
    }

    return jsonResponse(
      {
        status: 'created',
        message: 'Thanks! We will email the full report when it is ready.',
        data: { status: 'created' }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Early access signup failed:', error);
    const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    return jsonResponse(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
