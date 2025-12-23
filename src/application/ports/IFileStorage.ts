export interface IFileStorage {
  upload(path: string, file: Buffer, contentType: string): Promise<string>;
}
