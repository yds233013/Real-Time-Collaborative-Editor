declare module 'node-cache' {
  interface NodeCacheOptions {
    stdTTL?: number;
    checkperiod?: number;
    useClones?: boolean;
  }

  interface SetOptions {
    key: string;
    val: any;
  }

  class NodeCache {
    constructor(options?: NodeCacheOptions);
    set<T>(key: string, value: T, ttl?: number): boolean;
    get<T>(key: string): T | undefined;
    del(key: string | string[]): number;
    mset(items: SetOptions[]): boolean;
    mget<T>(keys: string[]): { [key: string]: T };
    flushAll(): void;
  }

  export = NodeCache;
} 