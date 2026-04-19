import { warmUpCache } from "@/cache/cache.warmup";
import RedisClient from "@/cache/redis.client";
import { Product } from "@/models";
import productCache from "@/cache/strategies/product.cache";

jest.mock("@/cache/redis.client");
jest.mock("@/models");
jest.mock("@/cache/strategies/product.cache");

describe("Cache Warmup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip warmup if Redis is disabled", async () => {
    (RedisClient.isEnabled as jest.Mock).mockReturnValue(false);
    await warmUpCache();
    expect(Product.findAll).not.toHaveBeenCalled();
  });

  it("should warm up cache with products", async () => {
    (RedisClient.isEnabled as jest.Mock).mockReturnValue(true);
    const mockProducts = [
      { id: 1, name: "Product 1" },
      { id: 2, name: "Product 2" },
    ];
    (Product.findAll as jest.Mock).mockResolvedValue(mockProducts);
    (productCache.setById as jest.Mock).mockResolvedValue(undefined);

    await warmUpCache();
    expect(Product.findAll).toHaveBeenCalledWith({ limit: 50 });
    expect(productCache.setById).toHaveBeenCalledTimes(2);
  });

  it("should handle warmup errors gracefully", async () => {
    (RedisClient.isEnabled as jest.Mock).mockReturnValue(true);
    (Product.findAll as jest.Mock).mockRejectedValue(new Error("DB error"));

    await expect(warmUpCache()).resolves.not.toThrow();
  });
});
