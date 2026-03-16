import CacheService from "../cache.service";
import keyBuilder from "../utils/key-builder";
import { Order } from "../../models";
import OrderQuery from "../../interfaces/query/order";

interface OrderListResult {
  orders: Order[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

const TTL = {
  SINGLE: 600,
  LIST: 300,
};

class OrderCacheStrategy {
  private singleCache = new CacheService<Order>(TTL.SINGLE);
  private listCache = new CacheService<OrderListResult>(TTL.LIST);

  async getById(id: number): Promise<Order | null> {
    const key = keyBuilder.entity("order", id);
    return this.singleCache.get(key);
  }

  async setById(id: number, order: Order): Promise<void> {
    const key = keyBuilder.entity("order", id);
    await this.singleCache.set(key, order, TTL.SINGLE);
  }

  async getList(query: OrderQuery): Promise<OrderListResult | null> {
    const key = keyBuilder.collection(
      "orders",
      query as Record<string, string | number | boolean | null | undefined>,
    );
    return this.listCache.get(key);
  }

  async setList(query: OrderQuery, result: OrderListResult): Promise<void> {
    const key = keyBuilder.collection(
      "orders",
      query as Record<string, string | number | boolean | null | undefined>,
    );
    await this.listCache.set(key, result, TTL.LIST);
  }

  async invalidateById(id: number): Promise<void> {
    await this.singleCache.delete(keyBuilder.entity("order", id));
  }

  async invalidateUserOrders(_userId: number): Promise<void> {
    await this.listCache.deletePattern(keyBuilder.typePattern("orders"));
  }
}

export default new OrderCacheStrategy();
