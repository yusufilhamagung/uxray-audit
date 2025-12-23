export interface ICaptureService {
  capture(url: string): Promise<Buffer>;
}
