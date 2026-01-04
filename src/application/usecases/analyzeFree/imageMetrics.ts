type ImageMetrics = {
  width?: number;
  height?: number;
  sizeBytes: number;
  type: string;
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const readPngDimensions = (buffer: Buffer) => {
  if (buffer.length < 24) return null;
  for (let i = 0; i < PNG_SIGNATURE.length; i += 1) {
    if (buffer[i] !== PNG_SIGNATURE[i]) return null;
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
};

const readJpegDimensions = (buffer: Buffer) => {
  if (buffer.length < 4) return null;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xc0 || marker === 0xc2) {
      if (offset + 8 >= buffer.length) return null;
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }

    if (offset + 3 >= buffer.length) return null;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength <= 0) return null;
    offset += 2 + segmentLength;
  }

  return null;
};

export const getImageMetrics = (buffer: Buffer, mimeType: string): ImageMetrics => {
  const base: ImageMetrics = {
    sizeBytes: buffer.length,
    type: mimeType
  };

  if (mimeType === 'image/png') {
    const dims = readPngDimensions(buffer);
    return dims ? { ...base, ...dims } : base;
  }

  if (mimeType === 'image/jpeg') {
    const dims = readJpegDimensions(buffer);
    return dims ? { ...base, ...dims } : base;
  }

  return base;
};
