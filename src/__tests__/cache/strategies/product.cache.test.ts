import productCache from "../../../cache/strategies/product.cache";
import CacheService from "../../../cache/cache.service";

jest.mock("../../../cache/cache.service");
jest.mock("../../../cache/utils/key-builder");

describe("Product Cache Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getById", () => {
    it("should get product by id", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(mockProduct);

      const product = await productCache.getById(1);
      expect(product).toEqual(mockProduct);
    });

    it("should return null if product not found", async () => {
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(null);

      const product = await productCache.getById(1);
      expect(product).toBeNull();
    });
  });

  describe("setById", () => {
    it("should set product by id", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      (CacheService.prototype.set as jest.Mock).mockResolvedValue(undefined);

      await productCache.setById(1, mockProduct as never);
      expect(CacheService.prototype.set).toHaveBeenCalled();
    });
  });

  describe("getList", () => {
    it("should get product list", async () => {
      const mockResult = { products: [{ id: 1 }], pagination: { total: 1 } };
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(mockResult);

      const result = await productCache.getList({ page: 1 });
      expect(result).toEqual(mockResult);
    });

    it("should return null if list not found", async () => {
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(null);

      const result = await productCache.getList({ page: 1 });
      expect(result).toBeNull();
    });
  });

  describe("setList", () => {
    it("should set product list", async () => {
      const mockResult = { products: [{ id: 1 }], pagination: { total: 1 } };
      (CacheService.prototype.set as jest.Mock).mockResolvedValue(undefined);

      await productCache.setList({ page: 1 }, mockResult as never);
      expect(CacheService.prototype.set).toHaveBeenCalled();
    });
  });

  describe("getBulk", () => {
    it("should get multiple products", async () => {
      const mockMap = new Map([
        ["test:product:id:1:v1", { id: 1, name: "Product 1" }],
        ["test:product:id:2:v1", { id: 2, name: "Product 2" }],
      ]);
      (CacheService.prototype.getMultiple as jest.Mock).mockResolvedValue(
        mockMap,
      );

      const result = await productCache.getBulk([1, 2]);
      expect(result.size).toBe(2);
    });

    it("should return empty map if no products", async () => {
      (CacheService.prototype.getMultiple as jest.Mock).mockResolvedValue(
        new Map(),
      );

      const result = await productCache.getBulk([]);
      expect(result.size).toBe(0);
    });
  });

  describe("setBulk", () => {
    it("should set multiple products", async () => {
      const products = new Map([
        [1, { id: 1, name: "Product 1" }],
        [2, { id: 2, name: "Product 2" }],
      ]);
      (CacheService.prototype.setMultiple as jest.Mock).mockResolvedValue(
        undefined,
      );

      await productCache.setBulk(products as never);
      expect(CacheService.prototype.setMultiple).toHaveBeenCalled();
    });
  });

  describe("invalidateById", () => {
    it("should invalidate product by id", async () => {
      (CacheService.prototype.delete as jest.Mock).mockResolvedValue(undefined);
      (CacheService.prototype.deletePattern as jest.Mock).mockResolvedValue(
        undefined,
      );

      await productCache.invalidateById(1);
      expect(CacheService.prototype.delete).toHaveBeenCalled();
      expect(CacheService.prototype.deletePattern).toHaveBeenCalled();
    });
  });

  describe("invalidateAll", () => {
    it("should invalidate all products", async () => {
      (CacheService.prototype.deletePattern as jest.Mock).mockResolvedValue(
        undefined,
      );

      await productCache.invalidateAll();
      expect(CacheService.prototype.deletePattern).toHaveBeenCalledTimes(2);
    });
  });
});
