import { randomUUID } from 'node:crypto';
import { PageTypeEnum, type AuditResult } from '@/lib/schema';
import { getStorageBucket } from '@/lib/env';
import { generateAudit } from '@/lib/ai';
import { supabaseServer } from '@/lib/supabaseServer';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg']);

export async function createAudit(params: {
  file: File;
  pageType: string;
  optionalContext?: string;
}): Promise<{
  auditId: string;
  result: AuditResult;
  imageUrl: string;
  modelUsed: string;
  latencyMs: number;
  createdAt: string;
}> {
  const pageTypeParsed = PageTypeEnum.safeParse(params.pageType);
  if (!pageTypeParsed.success) {
    throw new Error('Tipe halaman tidak valid.');
  }

  const file = params.file;
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Format file tidak didukung. Gunakan PNG atau JPG.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal 5MB.');
  }

  const ext = file.type === 'image/png' ? 'png' : 'jpg';
  const dateFolder = new Date().toISOString().slice(0, 10);
  const auditId = randomUUID();
  const filePath = `audits/${dateFolder}/${auditId}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const bucket = getStorageBucket();

  const uploadResult = await supabaseServer.storage.from(bucket).upload(filePath, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (uploadResult.error) {
    throw new Error('Gagal mengunggah gambar ke storage.');
  }

  const publicUrl = supabaseServer.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;

  const start = Date.now();
  const auditOutput = await generateAudit({
    imageBase64: buffer.toString('base64'),
    imageType: file.type,
    pageType: pageTypeParsed.data,
    optionalContext: params.optionalContext?.slice(0, 500)
  });
  const latencyMs = Date.now() - start;

  const insertPayload = {
    page_type: pageTypeParsed.data,
    image_url: publicUrl,
    ux_score: auditOutput.result.ux_score,
    result_json: auditOutput.result,
    model_used: auditOutput.modelUsed,
    latency_ms: latencyMs
  };

  const { data, error } = await supabaseServer
    .from('audits')
    .insert(insertPayload)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Gagal menyimpan hasil audit ke database.');
  }

  return {
    auditId: data.id as string,
    result: auditOutput.result,
    imageUrl: publicUrl,
    modelUsed: auditOutput.modelUsed,
    latencyMs,
    createdAt: data.created_at as string
  };
}
