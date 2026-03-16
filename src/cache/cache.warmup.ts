import { Product } from "../models";
import productCache from "./strategies/product.cache";
import RedisClient from "./redis.client";

export const warmUpCache = async (): Promise<void> => {
  if (!RedisClient.isEnabled()) return;

  try {
    console.log("[Cache] Warming up product cache...");

    const products = await Product.findAll({ limit: 50 });
    for (const product of products) {
      await productCache.setById(product.id, product);
    }

    console.log(`[Cache] Warmed up ${products.length} products`);
  } catch (error) {
    console.error("[Cache] Warm-up failed:", error);
  }
};
