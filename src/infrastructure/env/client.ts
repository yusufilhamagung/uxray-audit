import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_BRAND_LOGO_PATH: z.string().min(1).optional(),
  NEXT_PUBLIC_DEMO_MODE: z.preprocess(emptyToUndefined, z.enum(['true', 'false', '1', '0']).optional())
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
  NEXT_PUBLIC_BRAND_LOGO_PATH: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH,
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE
});

if (!parsed.success) {
  if (isProd) {
    throw new Error(`Invalid public environment variables: ${parsed.error.message}`);
  } else {
    console.warn('Invalid public environment variables detected.', parsed.error.flatten().fieldErrors);
  }
}

const raw = parsed.success ? parsed.data : {};
const demoModeFallback = isProd ? 'true' : 'false';
const demoModeValue = raw.NEXT_PUBLIC_DEMO_MODE ?? demoModeFallback;
const demoMode = demoModeValue === 'true' || demoModeValue === '1';

export const clientEnv = {
  supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  supabaseStorageBucket: raw.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? '',
  brandLogoPath: raw.NEXT_PUBLIC_BRAND_LOGO_PATH ?? '',
  demoMode
};

export type ClientEnv = typeof clientEnv;
