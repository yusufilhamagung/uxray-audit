import { z } from 'zod';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const serverEnvSchema = z.object({
  NODE_ENV: z.preprocess(emptyToUndefined, z.string().optional()),
  SUPABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SUPABASE_STORAGE_BUCKET: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  GEMINI_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  GEMINI_MODEL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AI_API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  AI_MODEL: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AI_MOCK_MODE: z.preprocess(emptyToUndefined, z.enum(['true', 'false']).optional()),
  PUPPETEER_EXECUTABLE_PATH: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  CHROME_EXECUTABLE_PATH: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  AUDIT_WORKER_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  AUDIT_STRATEGY: z.preprocess(emptyToUndefined, z.enum(['auto', 'chromium', 'worker']).optional())
});

const parsed = serverEnvSchema.safeParse(process.env);
if (!parsed.success) {
  if (isProd) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  } else {
    console.warn('Invalid environment variables detected.', parsed.error.flatten().fieldErrors);
  }
}

const raw = parsed.success ? parsed.data : {};
const aiMockMode = (raw.AI_MOCK_MODE ?? 'false') === 'true';
const supabaseUrl = raw.SUPABASE_URL ?? raw.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = raw.SUPABASE_ANON_KEY ?? raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = raw.SUPABASE_SERVICE_ROLE_KEY ?? '';

const missingInProd: string[] = [];
if (isProd) {
  if (!supabaseUrl) missingInProd.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey && !supabaseServiceRoleKey) {
    missingInProd.push('SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  }
  if (!aiMockMode) {
    if (!(raw.GEMINI_API_KEY ?? raw.AI_API_KEY)) missingInProd.push('GEMINI_API_KEY');
    if (!(raw.GEMINI_URL ?? raw.AI_API_URL)) missingInProd.push('GEMINI_URL');
  }
}

if (missingInProd.length > 0) {
  throw new Error(`Missing required env vars in production: ${missingInProd.join(', ')}`);
}

export const serverEnv = {
  nodeEnv,
  isProd,
  supabaseUrl,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  storageBucket: raw.SUPABASE_STORAGE_BUCKET ?? 'ux-audit',
  aiApiKey: raw.GEMINI_API_KEY ?? raw.AI_API_KEY ?? '',
  aiApiUrl: raw.GEMINI_URL ?? raw.AI_API_URL ?? 'https://generativelanguage.googleapis.com/v1beta/models',
  aiModel: raw.GEMINI_MODEL ?? raw.AI_MODEL ?? 'gemini-2.5-flash',
  aiMockMode,
  isSupabaseConfigured: Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey)),
  puppeteerExecutablePath: raw.PUPPETEER_EXECUTABLE_PATH,
  chromeExecutablePath: raw.CHROME_EXECUTABLE_PATH,
  auditWorkerUrl: raw.AUDIT_WORKER_URL,
  auditStrategy: raw.AUDIT_STRATEGY ?? 'auto'
};

export type ServerEnv = typeof serverEnv;
