import { IFileStorage } from '@/application/ports/IFileStorage';
import { supabaseServer } from '@/infrastructure/storage/supabaseServer';
import { getStorageBucket } from '@/shared/config/env';

export class SupabaseFileStorage implements IFileStorage {
  async upload(path: string, file: Buffer, contentType: string): Promise<string> {
    const bucket = getStorageBucket();
    const { error } = await supabaseServer.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: false
    });

    if (error) {
      throw new Error('Storage upload failed: ' + error.message);
    }

    const { data } = supabaseServer.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
