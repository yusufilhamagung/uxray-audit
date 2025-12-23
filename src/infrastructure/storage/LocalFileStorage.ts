import { IFileStorage } from '@/application/ports/IFileStorage';
import fs from 'fs/promises';
import path from 'path';

export class LocalFileStorage implements IFileStorage {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async upload(filePath: string, file: Buffer, contentType: string): Promise<string> {
    await this.ensureDir();
    // filePath usually comes as "audits/date/id.png". We need to flatten or handle subdirs.
    // Let's just use the basename to avoid deep directory creation in public/uploads for simplicity, 
    // or properly handle recursive creation.
    // The AuditFromImage/Url usecases generate paths like `audits/${dateFolder}/${auditId}.png`.
    
    const fileName = path.basename(filePath);
    const subFolder = path.dirname(filePath).replace('audits/', ''); // simple hack or strict
    
    // Actually, let's keep the structure inside public/uploads/audits
    const targetPath = path.join(process.cwd(), 'public', filePath);
    const targetDir = path.dirname(targetPath);
    
    try {
        await fs.mkdir(targetDir, { recursive: true });
    } catch {}

    await fs.writeFile(targetPath, file);
    
    // Return relative URL for browser access
    // Assuming Next.js serves public folder at root
    return `/${filePath}`;
  }
}
