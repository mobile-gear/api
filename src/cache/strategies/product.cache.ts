import CacheService from "../cache.service";
import keyBuilder from "../utils/key-builder";
import { Product } from "../../models";
import ProductQuery from "../../interfaces/query/product";
import { ProductListResult } from "../interfaces/cache-types";

const TTL = {
  SINGLE: 3600, // 1 hour
  LIST: 900, // 15 minutes
  BULK: 1800, // 30 minutes
};

class ProductCacheStrategy {
  private singleCache = new CacheService<Product>(TTL.SINGLE);
  private listCache = new CacheService<ProductListResult>(TTL.LIST);

  // Cache single product
  async getById(id: number): Promise<Product | null> {
    const key = keyBuilder.entity("product", id);
    return this.singleCache.get(key);
  }

  async setById(id: number, product: Product): Promise<void> {
    const key = keyBuilder.entity("product", id);
    await this.singleCache.set(key, product, TTL.SINGLE);
  }

  // Cache product list
  async getList(query: ProductQuery): Promise<ProductListResult | null> {
    const key = keyBuilder.collection(
      "products",
      query as Record<string, string | number | boolean | null | undefined>,
    );
    return this.listCache.get(key);
  }

  async setList(
    query: ProductQuery,
    result: ProductListResult,
  ): Promise<void> {
    const key = keyBuilder.collection(
      "products",
      query as Record<string, string | number | boolean | null | undefined>,
    );
    await this.listCache.set(key, result, TTL.LIST);
  }

  // Bulk fetch for N+1 optimization
  async getBulk(ids: number[]): Promise<Map<number, Product>> {
    const keys = ids.map((id) => keyBuilder.entity("product", id));
    const cached = await this.singleCache.getMultiple(keys);

    const result = new Map<number, Product>();
    cached.forEach((product, key) => {
      // Extract ID from key: "env:product:id:{id}:v1"
      const parts = key.split(":");
      const id = parseInt(parts[3]);
      result.set(id, product);
    });

    return result;
  }

  async setBulk(products: Map<number, Product>): Promise<void> {
    const entries = new Map<string, Product>();
    products.forEach((product, id) => {
      const key = keyBuilder.entity("product", id);
      entries.set(key, product);
    });

    await this.singleCache.setMultiple(entries, TTL.BULK);
  }

  // Invalidation
  async invalidateById(id: number): Promise<void> {
    // Invalidate single product
    await this.singleCache.delete(keyBuilder.entity("product", id));

    // Invalidate all lists (product update affects lists)
    await this.listCache.deletePattern(keyBuilder.typePattern("products"));
  }

  async invalidateAll(): Promise<void> {
    await this.singleCache.deletePattern(keyBuilder.typePattern("product"));
    await this.listCache.deletePattern(keyBuilder.typePattern("products"));
  }
}

export default new ProductCacheStrategy();
