import { z } from 'zod';
import { jsonResponse } from '@/shared/utils/response';
import { saveWaitlistEntry } from '@/infrastructure/waitlist/waitlistStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const payloadSchema = z.object({
  email: z.string().email(),
  auditId: z.string().uuid()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Invalid email payload.' },
      { status: 400 }
    );
  }

  try {
    const result = await saveWaitlistEntry({
      email: parsed.data.email,
      auditId: parsed.data.auditId
    });

    return jsonResponse(
      {
        status: 'success',
        message: result.status === 'exists' ? 'Already subscribed.' : 'Subscribed.',
        data: {
          status: result.status,
          audit_unlock_id: result.unlockId
        }
      },
      { status: result.status === 'exists' ? 200 : 201 }
    );
  } catch (error) {
    console.error('Waitlist signup failed', error);
    return jsonResponse(
      { status: 'error', message: 'Could not save email.' },
      { status: 500 }
    );
  }
}
