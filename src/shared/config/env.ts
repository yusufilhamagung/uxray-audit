export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function getOptionalEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

// Mock mode disabled in production
export function isMockMode(): boolean {
  return false;
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'ux-audit';
}
