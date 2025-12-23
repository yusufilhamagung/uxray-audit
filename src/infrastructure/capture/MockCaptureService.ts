import { ICaptureService } from '@/application/ports/ICaptureService';

export class MockCaptureService implements ICaptureService {
  async capture(url: string): Promise<Buffer> {
    // Return a 1x1 pixel transparent PNG or similar mock buffer
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    );
  }
}
