import productService from "@/services/product.service";
import productRepository from "@/repositories/product.repository";
import productCache from "@/cache/strategies/product.cache";
import { NotFoundError, ConflictError } from "@/utils/errors";
import { ForeignKeyConstraintError } from "sequelize";

jest.mock("@/repositories/product.repository");
jest.mock("@/cache/strategies/product.cache");

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllProducts", () => {
    it("should get products from cache", async () => {
      const mockResult = { products: [{ id: 1 }], pagination: { total: 1 } };
      (productCache.getList as jest.Mock).mockResolvedValue(mockResult);

      const result = await productService.getAllProducts({});
      expect(result).toEqual(mockResult);
      expect(productRepository.getAll).not.toHaveBeenCalled();
    });

    it("should get products from database if cache miss", async () => {
      const mockResult = { products: [{ id: 1 }], pagination: { total: 1 } };
      (productCache.getList as jest.Mock).mockResolvedValue(null);
      (productRepository.getAll as jest.Mock).mockResolvedValue(mockResult);

      const result = await productService.getAllProducts({});
      expect(result).toEqual(mockResult);
      expect(productCache.setList).toHaveBeenCalled();
    });
  });

  describe("getProductById", () => {
    it("should get product from cache", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      (productCache.getById as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductById(1);
      expect(result).toEqual(mockProduct);
      expect(productRepository.getOneById).not.toHaveBeenCalled();
    });

    it("should get product from database if cache miss", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      (productCache.getById as jest.Mock).mockResolvedValue(null);
      (productRepository.getOneById as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await productService.getProductById(1);
      expect(result).toEqual(mockProduct);
      expect(productCache.setById).toHaveBeenCalledWith(1, mockProduct);
    });

    it("should throw NotFoundError if product not found in cache or DB", async () => {
      (productCache.getById as jest.Mock).mockResolvedValue(null);
      (productRepository.getOneById as jest.Mock).mockResolvedValue(null);

      await expect(productService.getProductById(1)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("createProduct", () => {
    it("should create product successfully", async () => {
      const mockProduct = { id: 1, name: "Product 1", price: 100 };
      (productRepository.createOne as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.createProduct(mockProduct as never);
      expect(result).toEqual(mockProduct);
      expect(productCache.invalidateAll).toHaveBeenCalled();
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const mockProduct = { id: 1, name: "Updated Product" };
      (productRepository.updateOneById as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await productService.updateProduct(1, {
        name: "Updated Product",
      } as never);
      expect(result).toEqual(mockProduct);
      expect(productCache.invalidateById).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError if product not found", async () => {
      (productRepository.updateOneById as jest.Mock).mockResolvedValue(null);

      await expect(
        productService.updateProduct(1, { name: "Updated" } as never),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteProduct", () => {
    it("should delete product successfully", async () => {
      const mockProduct = { id: 1, name: "Product 1" };
      (productRepository.deleteOneById as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      await productService.deleteProduct(1);
      expect(productCache.invalidateById).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError if product not found", async () => {
      (productRepository.deleteOneById as jest.Mock).mockResolvedValue(null);

      await expect(productService.deleteProduct(1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should throw ConflictError if foreign key constraint error", async () => {
      const fkError = new ForeignKeyConstraintError({
        message: "Foreign key constraint",
      });
      (productRepository.deleteOneById as jest.Mock).mockRejectedValue(fkError);

      await expect(productService.deleteProduct(1)).rejects.toThrow(
        ConflictError,
      );
    });

    it("should rethrow other errors", async () => {
      const error = new Error("Some other error");
      (productRepository.deleteOneById as jest.Mock).mockRejectedValue(error);

      await expect(productService.deleteProduct(1)).rejects.toThrow(
        "Some other error",
      );
    });
  });
});
