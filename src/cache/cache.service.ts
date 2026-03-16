import RedisClient from "./redis.client";
import { ICacheService } from "./interfaces/cache.interface";
import cacheMetrics from "./cache.metrics";

class CacheService<T> implements ICacheService<T> {
  private redis = RedisClient.getInstance();
  private defaultTTL: number;

  constructor(defaultTTL: number = Number(process.env.REDIS_DEFAULT_TTL) || 3600) {
    this.defaultTTL = defaultTTL;
  }

  async get(key: string): Promise<T | null> {
    if (!this.redis || !RedisClient.isEnabled()) return null;

    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        cacheMetrics.recordMiss();
        return null;
      }
      cacheMetrics.recordHit();
      return JSON.parse(cached) as T;
    } catch (error) {
      cacheMetrics.recordError();
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.redis || !RedisClient.isEnabled()) return;

    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.redis.setex(key, expiry, serialized);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis || !RedisClient.isEnabled()) return;

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    if (!this.redis || !RedisClient.isEnabled()) return 0;

    try {
      const keys: string[] = [];
      const stream = this.redis.scanStream({ match: pattern, count: 100 });

      for await (const batch of stream) {
        keys.push(...batch);
      }

      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error("Cache deletePattern error:", error);
      return 0;
    }
  }

  async getMultiple(keys: string[]): Promise<Map<string, T>> {
    if (!this.redis || !RedisClient.isEnabled() || keys.length === 0) {
      return new Map();
    }

    try {
      const values = await this.redis.mget(...keys);
      const result = new Map<string, T>();

      values.forEach((val, index) => {
        if (val) {
          result.set(keys[index], JSON.parse(val));
        }
      });

      return result;
    } catch (error) {
      console.error("Cache getMultiple error:", error);
      return new Map();
    }
  }

  async setMultiple(entries: Map<string, T>, ttl?: number): Promise<void> {
    if (!this.redis || !RedisClient.isEnabled() || entries.size === 0) return;

    try {
      const pipeline = this.redis.pipeline();
      const expiry = ttl || this.defaultTTL;

      entries.forEach((value, key) => {
        pipeline.setex(key, expiry, JSON.stringify(value));
      });

      await pipeline.exec();
    } catch (error) {
      console.error("Cache setMultiple error:", error);
    }
  }

  async getOrSet<K>(
    key: string,
    fetcher: () => Promise<K>,
    ttl?: number,
  ): Promise<K> {
    const cached = await this.get(key);
    if (cached !== null) return cached as unknown as K;

    const fresh = await fetcher();
    await this.set(key, fresh as unknown as T, ttl);
    return fresh;
  }
}

export default CacheService;
