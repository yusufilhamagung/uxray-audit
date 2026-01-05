import { z } from 'zod';

export const AccessLevelEnum = z.enum(['free', 'early_access', 'full']);
export type AccessLevel = z.infer<typeof AccessLevelEnum>;

export const isAccessLevel = (value: unknown): value is AccessLevel =>
  AccessLevelEnum.safeParse(value).success;
