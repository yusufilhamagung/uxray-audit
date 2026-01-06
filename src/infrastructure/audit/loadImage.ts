import fs from 'fs/promises';
import path from 'path';

const inferMimeType = (imageUrl: string) => {
  const ext = imageUrl.split('.').pop()?.toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'image/png';
};

export const loadImageBase64 = async (params: {
  imageUrl: string;
  imageType?: string;
  imagePath?: string;
}) => {
  const { imageUrl, imageType, imagePath } = params;
  const resolvedType = imageType ?? inferMimeType(imageUrl);

  if (imagePath) {
    const buffer = await fs.readFile(imagePath);
    return { base64: buffer.toString('base64'), mimeType: resolvedType };
  }

  if (imageUrl.startsWith('/')) {
    const localPath = path.join(process.cwd(), 'public', imageUrl);
    const buffer = await fs.readFile(localPath);
    return { base64: buffer.toString('base64'), mimeType: resolvedType };
  }

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return { base64: buffer.toString('base64'), mimeType: resolvedType };
};
