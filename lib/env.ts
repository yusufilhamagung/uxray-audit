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

export function isMockMode(): boolean {
  const flag = process.env.AI_MOCK_MODE;
  return flag === 'true' || flag === '1';
}

export function getStorageBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'ux-audit';
}
