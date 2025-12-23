import { GeminiAuditAnalyzer } from '@/infrastructure/ai/GeminiAuditAnalyzer';
import { SupabaseAuditRepository } from '@/infrastructure/persistence/SupabaseAuditRepository';
import { FileSystemAuditRepository } from '@/infrastructure/persistence/FileSystemAuditRepository';
import { SupabaseFileStorage } from '@/infrastructure/storage/SupabaseFileStorage';
import { LocalFileStorage } from '@/infrastructure/storage/LocalFileStorage';
import { PuppeteerCaptureService } from '@/infrastructure/capture/PuppeteerCaptureService';
import { AuditFromImage } from '@/application/usecases/AuditFromImage';
import { AuditFromUrl } from '@/application/usecases/AuditFromUrl';

const analyzer = new GeminiAuditAnalyzer();

// Check for Supabase configuration
const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

const repository = isSupabaseConfigured ? new SupabaseAuditRepository() : new FileSystemAuditRepository();
const storage = isSupabaseConfigured ? new SupabaseFileStorage() : new LocalFileStorage();
const capture = new PuppeteerCaptureService();

console.log(`[Composition] Using ${isSupabaseConfigured ? 'Supabase' : 'File System'} Persistence & Storage.`);
console.log(`[Composition] Gemini Analyzer AI initialized.`);

export const auditFromImage = new AuditFromImage(analyzer, repository, storage);
export const auditFromUrl = new AuditFromUrl(capture, analyzer, repository, storage);
