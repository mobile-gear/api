import cacheMetrics from "../../cache/cache.metrics";

describe("Cache Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("recordHit", () => {
    it("should record cache hit", () => {
      cacheMetrics.recordHit();
      const stats = cacheMetrics.getStats();
      expect(stats.hits).toBeGreaterThan(0);
    });
  });

  describe("recordMiss", () => {
    it("should record cache miss", () => {
      cacheMetrics.recordMiss();
      const stats = cacheMetrics.getStats();
      expect(stats.misses).toBeGreaterThan(0);
    });
  });

  describe("recordError", () => {
    it("should record cache error", () => {
      cacheMetrics.recordError();
      const stats = cacheMetrics.getStats();
      expect(stats.errors).toBeGreaterThan(0);
    });
  });

  describe("getStats", () => {
    it("should return stats", () => {
      const stats = cacheMetrics.getStats();
      expect(stats).toHaveProperty("hits");
      expect(stats).toHaveProperty("misses");
      expect(stats).toHaveProperty("errors");
      expect(stats).toHaveProperty("hitRate");
      expect(stats).toHaveProperty("totalRequests");
    });

    it("should calculate hit rate correctly", () => {
      cacheMetrics.reset();
      cacheMetrics.recordHit();
      cacheMetrics.recordHit();
      cacheMetrics.recordMiss();
      const stats = cacheMetrics.getStats();
      expect(stats.hitRate).toBe("66.7%");
    });

    it("should return 0% hit rate when no requests", () => {
      cacheMetrics.reset();
      const stats = cacheMetrics.getStats();
      expect(stats.hitRate).toBe("0%");
    });

    it("should handle stats with only errors", () => {
      cacheMetrics.reset();
      cacheMetrics.recordError();
      const stats = cacheMetrics.getStats();
      expect(stats.errors).toBe(1);
      expect(stats.hitRate).toBe("0%");
      expect(stats.totalRequests).toBe(0);
    });

    it("should handle stats with only misses", () => {
      cacheMetrics.reset();
      cacheMetrics.recordMiss();
      cacheMetrics.recordMiss();
      const stats = cacheMetrics.getStats();
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe("0.0%");
    });

    it("should handle stats with only hits", () => {
      cacheMetrics.reset();
      cacheMetrics.recordHit();
      cacheMetrics.recordHit();
      cacheMetrics.recordHit();
      const stats = cacheMetrics.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.hitRate).toBe("100.0%");
    });

    it("should handle mixed hits and misses", () => {
      cacheMetrics.reset();
      cacheMetrics.recordHit();
      cacheMetrics.recordMiss();
      cacheMetrics.recordHit();
      cacheMetrics.recordMiss();
      cacheMetrics.recordHit();
      const stats = cacheMetrics.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(2);
      expect(stats.totalRequests).toBe(5);
      expect(stats.hitRate).toBe("60.0%");
    });

    it("should handle single hit", () => {
      cacheMetrics.reset();
      cacheMetrics.recordHit();
      const stats = cacheMetrics.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.hitRate).toBe("100.0%");
    });

    it("should handle single miss", () => {
      cacheMetrics.reset();
      cacheMetrics.recordMiss();
      const stats = cacheMetrics.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe("0.0%");
    });
  });

  describe("reset", () => {
    it("should reset metrics", () => {
      cacheMetrics.recordHit();
      cacheMetrics.recordMiss();
      cacheMetrics.reset();
      const stats = cacheMetrics.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });
});
