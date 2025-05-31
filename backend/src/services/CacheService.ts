import NodeCache from 'node-cache';
import { IDocument } from '../models/Document';

export class CacheService {
  private cache: NodeCache;
  private readonly stdTTL = 600; // 10 minutes cache duration

  constructor() {
    this.cache = new NodeCache({
      stdTTL: this.stdTTL,
      checkperiod: 120, // Check for expired entries every 2 minutes
      useClones: false // Store references instead of cloning objects
    });
  }

  public async getDocument(id: string): Promise<IDocument | null> {
    return this.cache.get<IDocument>(id) || null;
  }

  public setDocument(id: string, document: IDocument): void {
    this.cache.set(id, document);
  }

  public invalidateDocument(id: string): void {
    this.cache.del(id);
  }

  public async getOrFetchDocument(id: string, fetchFn: () => Promise<IDocument | null>): Promise<IDocument | null> {
    const cached = await this.getDocument(id);
    if (cached) return cached;

    const fetched = await fetchFn();
    if (fetched) {
      this.setDocument(id, fetched);
    }

    return fetched;
  }

  // Batch operations
  public setMany(documents: { id: string; doc: IDocument }[]): void {
    const cacheObj: { [key: string]: IDocument } = {};
    documents.forEach(({ id, doc }) => {
      cacheObj[id] = doc;
    });
    this.cache.mset(Object.entries(cacheObj).map(([key, val]) => ({ key, val })));
  }

  public getMany(ids: string[]): { [key: string]: IDocument } {
    return this.cache.mget<IDocument>(ids);
  }

  public clearAll(): void {
    this.cache.flushAll();
  }
}

export const cacheService = new CacheService(); 