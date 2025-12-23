import { IAuditRepository, AuditEntity } from '@/application/ports/IAuditRepository';
import fs from 'fs/promises';
import path from 'path';

export class FileSystemAuditRepository implements IAuditRepository {
  private readonly storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), 'data', 'audits');
    // Ensure directory exists synchronously or lazily
  }

  private async ensureDir() {
    try {
      await fs.access(this.storageDir);
    } catch {
      await fs.mkdir(this.storageDir, { recursive: true });
    }
  }

  async save(audit: Omit<AuditEntity, 'created_at'>): Promise<AuditEntity> {
    await this.ensureDir();
    
    // Create new entity with timestamp
    const entity: AuditEntity = {
      ...audit,
      created_at: new Date().toISOString()
    };

    const filePath = path.join(this.storageDir, `${entity.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(entity, null, 2), 'utf-8');

    return entity;
  }

  async findById(id: string): Promise<AuditEntity | null> {
    await this.ensureDir();
    const filePath = path.join(this.storageDir, `${id}.json`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as AuditEntity;
    } catch {
      return null;
    }
  }
}
