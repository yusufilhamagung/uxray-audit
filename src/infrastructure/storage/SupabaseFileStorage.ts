import { IFileStorage } from '@/application/ports/IFileStorage';
import { getSupabaseServerClient } from '@/infrastructure/storage/supabase/server';
import { serverEnv } from '@/infrastructure/env/server';

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

    if (serverEnv.supabaseServiceRoleKey) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24);
      if (signedError || !signedData?.signedUrl) {
        throw new Error('Storage signed URL failed: ' + (signedError?.message ?? 'unknown error'));
      }
      return signedData.signedUrl;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
