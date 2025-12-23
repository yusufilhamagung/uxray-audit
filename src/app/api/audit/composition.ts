import { AnthropicAuditAnalyzer } from '@/infrastructure/ai/AnthropicAuditAnalyzer';
import { SupabaseAuditRepository } from '@/infrastructure/persistence/SupabaseAuditRepository';
import { SupabaseFileStorage } from '@/infrastructure/storage/SupabaseFileStorage';
import { MockCaptureService } from '@/infrastructure/capture/MockCaptureService';
import { AuditFromImage } from '@/application/usecases/AuditFromImage';
import { AuditFromUrl } from '@/application/usecases/AuditFromUrl';

const analyzer = new AnthropicAuditAnalyzer();
const repository = new SupabaseAuditRepository();
const storage = new SupabaseFileStorage();
const capture = new MockCaptureService();

export const auditFromImage = new AuditFromImage(analyzer, repository, storage);
export const auditFromUrl = new AuditFromUrl(capture, analyzer, repository, storage);
