import { z } from 'zod';

export const EarlyAccessSchema = z.object({
  email: z.string().email(),
  source: z.string().max(80).optional(),
  audit_id: z.string().uuid().optional()
});

export type EarlyAccessPayload = z.infer<typeof EarlyAccessSchema>;
