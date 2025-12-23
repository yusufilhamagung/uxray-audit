import { GeminiAuditAnalyzer } from '@/infrastructure/ai/GeminiAuditAnalyzer';
import { MockAuditAnalyzer } from '@/infrastructure/ai/MockAuditAnalyzer';
import { SupabaseAuditRepository } from '@/infrastructure/persistence/SupabaseAuditRepository';
import { FileSystemAuditRepository } from '@/infrastructure/persistence/FileSystemAuditRepository';
import { SupabaseFileStorage } from '@/infrastructure/storage/SupabaseFileStorage';
import { LocalFileStorage } from '@/infrastructure/storage/LocalFileStorage';
import { PuppeteerCaptureService } from '@/infrastructure/capture/PuppeteerCaptureService';
import { AuditFromImage } from '@/application/usecases/AuditFromImage';
import { AuditFromUrl } from '@/application/usecases/AuditFromUrl';
import { serverEnv } from '@/lib/env/server';

const analyzer = serverEnv.aiMockMode ? new MockAuditAnalyzer() : new GeminiAuditAnalyzer();
const isSupabaseConfigured = serverEnv.isSupabaseConfigured;

const repository = isSupabaseConfigured ? new SupabaseAuditRepository() : new FileSystemAuditRepository();
const storage = isSupabaseConfigured ? new SupabaseFileStorage() : new LocalFileStorage();
const capture = new PuppeteerCaptureService();

console.log(`[Composition] Using ${isSupabaseConfigured ? 'Supabase' : 'File System'} Persistence & Storage.`);
console.log(`[Composition] ${serverEnv.aiMockMode ? 'Mock' : 'Gemini'} Analyzer AI initialized.`);

export const auditFromImage = new AuditFromImage(analyzer, repository, storage);
export const auditFromUrl = new AuditFromUrl(capture, analyzer, repository, storage);
