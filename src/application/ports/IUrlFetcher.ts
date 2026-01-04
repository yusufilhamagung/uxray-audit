export interface IUrlFetcher {
  fetchContext(url: string): Promise<string | null>;
}
