import { IFileStorage } from '@/application/ports/IFileStorage';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { serverEnv } from '@/lib/env/server';

export class SupabaseFileStorage implements IFileStorage {
  async upload(path: string, file: Buffer, contentType: string): Promise<string> {
    const supabase = getSupabaseServerClient();
    const bucket = serverEnv.storageBucket;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: false
    });

    if (error) {
      throw new Error('Storage upload failed: ' + error.message);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
