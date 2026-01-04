import { GeminiAuditAnalyzer } from '@/infrastructure/ai/GeminiAuditAnalyzer';
import { MockAuditAnalyzer } from '@/infrastructure/ai/MockAuditAnalyzer';
import { SupabaseAuditRepository } from '@/infrastructure/persistence/SupabaseAuditRepository';
import { FileSystemAuditRepository } from '@/infrastructure/persistence/FileSystemAuditRepository';
import { SupabaseFileStorage } from '@/infrastructure/storage/SupabaseFileStorage';
import { LocalFileStorage } from '@/infrastructure/storage/LocalFileStorage';
import { PuppeteerCaptureService } from '@/infrastructure/fetchers/PuppeteerCaptureService';
import { UrlFetcher } from '@/infrastructure/fetchers/urlFetcher';
import { AnalyzeFree } from '@/application/usecases/analyzeFree';
import { AuditFromUrl } from '@/application/usecases/AuditFromUrl';
import { GenerateAudit } from '@/application/usecases/generateAudit';
import { serverEnv } from '@/infrastructure/env/server';

const analyzer = serverEnv.aiMockMode ? new MockAuditAnalyzer() : new GeminiAuditAnalyzer();
const isSupabaseConfigured = serverEnv.isSupabaseConfigured;

const repository = isSupabaseConfigured ? new SupabaseAuditRepository() : new FileSystemAuditRepository();
const storage = isSupabaseConfigured ? new SupabaseFileStorage() : new LocalFileStorage();
const capture = new PuppeteerCaptureService();
const urlFetcher = new UrlFetcher();

console.log(`[Composition] Using ${isSupabaseConfigured ? 'Supabase' : 'File System'} Persistence & Storage.`);
console.log(`[Composition] ${serverEnv.aiMockMode ? 'Mock' : 'Gemini'} Analyzer initialized.`);

export const analyzeFree = new AnalyzeFree(analyzer, repository, storage);
export const auditFromUrl = new AuditFromUrl(capture, analyzer, repository, storage, urlFetcher);
export const generateAudit = new GenerateAudit(analyzeFree, auditFromUrl);
