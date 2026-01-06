import { z } from 'zod';
import { jsonResponse } from '@/shared/utils/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const payloadSchema = z.object({
  eventName: z.string().min(1),
  payload: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonResponse(
      { status: 'error', message: 'Invalid event payload.' },
      { status: 400 }
    );
  }

  console.info(`[analytics] ${parsed.data.eventName}`, parsed.data.payload ?? {});

  return jsonResponse(
    { status: 'success', message: 'Event recorded.' },
    { status: 200 }
  );
}
