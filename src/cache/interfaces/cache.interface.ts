import { CacheableRecord } from "./cache-types";

export interface ICacheService<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<number>;
  getMultiple(keys: string[]): Promise<Map<string, T>>;
  setMultiple(entries: Map<string, T>, ttl?: number): Promise<void>;
}

export interface CacheOptions {
  ttl?: number;
  skipCache?: boolean;
}

export type CacheKey = string | CacheableRecord;
