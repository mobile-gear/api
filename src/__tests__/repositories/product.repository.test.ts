import productRepository from "../../repositories/product.repository";
import { Product } from "../../models";

jest.mock("../../models");

describe("Product Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return products with pagination", async () => {
      const mockProducts = [{ id: 1, name: "Product 1" }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ page: 1, limit: 10 });
      expect(result.products).toEqual(mockProducts);
      expect(result.pagination).toEqual({ page: 1, limit: 10, count: 1 });
    });

    it("should filter by category", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1", category: "electronics" },
      ];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({
        category: "electronics",
      });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by searchTerm", async () => {
      const mockProducts = [{ id: 1, name: "Test Product" }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ searchTerm: "test" });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by minPrice", async () => {
      const mockProducts = [{ id: 1, name: "Product 1", price: 100 }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ minPrice: 50 });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by maxPrice", async () => {
      const mockProducts = [{ id: 1, name: "Product 1", price: 100 }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ maxPrice: 200 });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by minPrice and maxPrice", async () => {
      const mockProducts = [{ id: 1, name: "Product 1", price: 100 }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({
        minPrice: 50,
        maxPrice: 200,
      });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by outOfStock yes", async () => {
      const mockProducts = [{ id: 1, name: "Product 1", stock: 0 }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ outOfStock: "yes" });
      expect(result.products).toEqual(mockProducts);
    });

    it("should filter by outOfStock no", async () => {
      const mockProducts = [{ id: 1, name: "Product 1", stock: 10 }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({ outOfStock: "no" });
      expect(result.products).toEqual(mockProducts);
    });

    it("should sort by valid field with ASC order", async () => {
      const mockProducts = [{ id: 1, name: "Product 1" }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({
        sortBy: "name",
        sortOrder: "asc",
      });
      expect(result.products).toEqual(mockProducts);
    });

    it("should sort by valid field with DESC order", async () => {
      const mockProducts = [{ id: 1, name: "Product 1" }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({
        sortBy: "price",
        sortOrder: "desc",
      });
      expect(result.products).toEqual(mockProducts);
    });

    it("should not sort by invalid field", async () => {
      const mockProducts = [{ id: 1, name: "Product 1" }];
      (Product.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockProducts,
      });

      const result = await productRepository.getAll({
        sortBy: "invalid",
        sortOrder: "asc",
      });
      expect(result.products).toEqual(mockProducts);
    });
  });

  describe("getOneById", () => {
    it("should return product by id", async () => {
      const mockProduct = { id: 1, name: "Test Product" };
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const product = await productRepository.getOneById(1);
      expect(product).toEqual(mockProduct);
      expect(Product.findByPk).toHaveBeenCalledWith(1, {
        transaction: undefined,
      });
    });

    it("should return null if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const product = await productRepository.getOneById(999);
      expect(product).toBeNull();
    });
  });

  describe("getByIds", () => {
    it("should return products by ids", async () => {
      const mockProducts = [
        { id: 1, name: "Product 1" },
        { id: 2, name: "Product 2" },
      ];
      (Product.findAll as jest.Mock).mockResolvedValue(mockProducts);

      const products = await productRepository.getByIds([1, 2]);
      expect(products).toEqual(mockProducts);
      expect(Product.findAll).toHaveBeenCalledWith({
        where: { id: [1, 2] },
        transaction: undefined,
      });
    });
  });

  describe("createOne", () => {
    it("should create product", async () => {
      const productData = {
        name: "New Product",
        description: "New Description",
        price: 100,
        stock: 10,
        category: "electronics",
        img: "test.jpg",
      };
      const mockProduct = { id: 1, ...productData };
      (Product.create as jest.Mock).mockResolvedValue(mockProduct);

      const product = await productRepository.createOne(productData);
      expect(product).toEqual(mockProduct);
      expect(Product.create).toHaveBeenCalledWith(productData, {
        transaction: undefined,
      });
    });
  });

  describe("updateOneById", () => {
    it("should update product", async () => {
      const updateData = { name: "Updated Product" };
      const mockProduct = {
        id: 1,
        name: "Updated Product",
        update: jest.fn().mockResolvedValue(undefined),
      };
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const product = await productRepository.updateOneById(1, updateData);
      expect(product).toEqual(mockProduct);
      expect(mockProduct.update).toHaveBeenCalledWith(updateData, {
        transaction: undefined,
      });
    });

    it("should return null if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const product = await productRepository.updateOneById(999, {
        name: "Updated",
      });
      expect(product).toBeNull();
    });
  });

  describe("deleteOneById", () => {
    it("should delete product", async () => {
      const mockProduct = {
        id: 1,
        name: "Deleted Product",
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);

      const product = await productRepository.deleteOneById(1);
      expect(product).toEqual(mockProduct);
      expect(mockProduct.destroy).toHaveBeenCalled();
    });

    it("should return null if product not found", async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);

      const product = await productRepository.deleteOneById(999);
      expect(product).toBeNull();
    });
  });
});
