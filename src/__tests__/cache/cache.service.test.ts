import CacheService from "../../cache/cache.service";
import RedisClient from "../../cache/redis.client";
import cacheMetrics from "../../cache/cache.metrics";

jest.mock("../../cache/redis.client");
jest.mock("../../cache/cache.metrics");

describe("Cache Service", () => {
  let cacheService: CacheService<unknown>;
  let mockRedis: {
    get: jest.Mock;
    setex: jest.Mock;
    del: jest.Mock;
    scanStream: jest.Mock;
    mget: jest.Mock;
    pipeline: jest.Mock;
    exec: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      scanStream: jest.fn(),
      mget: jest.fn(),
      pipeline: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };
    (RedisClient.getInstance as jest.Mock).mockReturnValue(mockRedis);
    (RedisClient.isEnabled as jest.Mock).mockReturnValue(true);
    cacheService = new CacheService(3600);
  });

  describe("get", () => {
    it("should return cached value", async () => {
      mockRedis.get.mockResolvedValue('{"id":1,"name":"test"}');
      cacheMetrics.recordHit = jest.fn();

      const result = await cacheService.get("key1");
      expect(result).toEqual({ id: 1, name: "test" });
      expect(cacheMetrics.recordHit).toHaveBeenCalled();
    });

    it("should return null if cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);
      cacheMetrics.recordMiss = jest.fn();

      const result = await cacheService.get("key1");
      expect(result).toBeNull();
      expect(cacheMetrics.recordMiss).toHaveBeenCalled();
    });

    it("should return null if redis disabled", async () => {
      (RedisClient.isEnabled as jest.Mock).mockReturnValue(false);

      const result = await cacheService.get("key1");
      expect(result).toBeNull();
    });

    it("should return null on error", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis error"));
      cacheMetrics.recordError = jest.fn();

      const result = await cacheService.get("key1");
      expect(result).toBeNull();
      expect(cacheMetrics.recordError).toHaveBeenCalled();
    });
  });

  describe("set", () => {
    it("should set value in cache", async () => {
      await cacheService.set("key1", { id: 1, name: "test" });
      expect(mockRedis.setex).toHaveBeenCalledWith(
        "key1",
        3600,
        JSON.stringify({ id: 1, name: "test" }),
      );
    });

    it("should use custom TTL", async () => {
      await cacheService.set("key1", { id: 1 }, 7200);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        "key1",
        7200,
        JSON.stringify({ id: 1 }),
      );
    });

    it("should do nothing if redis disabled", async () => {
      (RedisClient.isEnabled as jest.Mock).mockReturnValue(false);
      await cacheService.set("key1", { id: 1 });
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete key from cache", async () => {
      await cacheService.delete("key1");
      expect(mockRedis.del).toHaveBeenCalledWith("key1");
    });

    it("should do nothing if redis disabled", async () => {
      (RedisClient.isEnabled as jest.Mock).mockReturnValue(false);
      await cacheService.delete("key1");
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("deletePattern", () => {
    it("should delete keys matching pattern", async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield ["key1", "key2"];
        },
      };
      mockRedis.scanStream.mockReturnValue(mockStream);
      mockRedis.del.mockResolvedValue(2);

      const result = await cacheService.deletePattern("user:*");
      expect(result).toBe(2);
      expect(mockRedis.del).toHaveBeenCalledWith("key1", "key2");
    });

    it("should return 0 if no keys found", async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield [];
        },
      };
      mockRedis.scanStream.mockReturnValue(mockStream);

      const result = await cacheService.deletePattern("user:*");
      expect(result).toBe(0);
    });
  });

  describe("getMultiple", () => {
    it("should get multiple values", async () => {
      mockRedis.mget.mockResolvedValue(['{"id":1}', '{"id":2}', null]);
      const result = await cacheService.getMultiple(["key1", "key2", "key3"]);
      expect(result.get("key1")).toEqual({ id: 1 });
      expect(result.get("key2")).toEqual({ id: 2 });
      expect(result.get("key3")).toBeUndefined();
    });

    it("should return empty map if no keys", async () => {
      const result = await cacheService.getMultiple([]);
      expect(result).toEqual(new Map());
    });
  });

  describe("setMultiple", () => {
    it("should set multiple values", async () => {
      const entries = new Map([
        ["key1", { id: 1 }],
        ["key2", { id: 2 }],
      ]);
      await cacheService.setMultiple(entries);
      expect(mockRedis.pipeline).toHaveBeenCalled();
      expect(mockRedis.exec).toHaveBeenCalled();
    });

    it("should do nothing if no entries", async () => {
      await cacheService.setMultiple(new Map());
      expect(mockRedis.pipeline).not.toHaveBeenCalled();
    });
  });

  describe("getOrSet", () => {
    it("should return cached value if exists", async () => {
      mockRedis.get.mockResolvedValue('{"id":1}');
      const fetcher = jest.fn().mockResolvedValue({ id: 2 });

      const result = await cacheService.getOrSet("key1", fetcher);
      expect(result).toEqual({ id: 1 });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("should fetch and set value if not cached", async () => {
      mockRedis.get.mockResolvedValue(null);
      const fetcher = jest.fn().mockResolvedValue({ id: 2 });

      const result = await cacheService.getOrSet("key1", fetcher);
      expect(result).toEqual({ id: 2 });
      expect(fetcher).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalled();
    });
  });
});
