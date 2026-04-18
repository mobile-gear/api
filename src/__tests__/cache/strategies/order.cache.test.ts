import orderCache from "../../../cache/strategies/order.cache";
import CacheService from "../../../cache/cache.service";

jest.mock("../../../cache/cache.service");
jest.mock("../../../cache/utils/key-builder");

describe("Order Cache Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getById", () => {
    it("should get order by id", async () => {
      const mockOrder = { id: 1, status: "pending" };
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderCache.getById(1);
      expect(order).toEqual(mockOrder);
    });

    it("should return null if order not found", async () => {
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(null);

      const order = await orderCache.getById(1);
      expect(order).toBeNull();
    });
  });

  describe("setById", () => {
    it("should set order by id", async () => {
      const mockOrder = { id: 1, status: "pending" };
      (CacheService.prototype.set as jest.Mock).mockResolvedValue(undefined);

      await orderCache.setById(1, mockOrder as never);
      expect(CacheService.prototype.set).toHaveBeenCalled();
    });
  });

  describe("getList", () => {
    it("should get order list", async () => {
      const mockResult = { orders: [{ id: 1 }], pagination: { total: 1 } };
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await orderCache.getList({ page: 1 });
      expect(result).toEqual(mockResult);
    });

    it("should return null if list not found", async () => {
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(null);

      const result = await orderCache.getList({ page: 1 });
      expect(result).toBeNull();
    });
  });

  describe("setList", () => {
    it("should set order list", async () => {
      const mockResult = { orders: [{ id: 1 }], pagination: { total: 1 } };
      (CacheService.prototype.set as jest.Mock).mockResolvedValue(undefined);

      await orderCache.setList({ page: 1 }, mockResult as never);
      expect(CacheService.prototype.set).toHaveBeenCalled();
    });
  });

  describe("invalidateById", () => {
    it("should invalidate order by id", async () => {
      (CacheService.prototype.delete as jest.Mock).mockResolvedValue(undefined);

      await orderCache.invalidateById(1);
      expect(CacheService.prototype.delete).toHaveBeenCalled();
    });
  });

  describe("invalidateUserOrders", () => {
    it("should invalidate user orders", async () => {
      (CacheService.prototype.deletePattern as jest.Mock).mockResolvedValue(
        undefined,
      );

      await orderCache.invalidateUserOrders(1);
      expect(CacheService.prototype.deletePattern).toHaveBeenCalled();
    });
  });
});
