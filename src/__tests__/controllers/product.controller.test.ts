import * as productController from "../../controllers/product.controller";
import productService from "../../services/product.service";
import { NotFoundError, UnauthorizedError } from "../../utils/errors";
import { Request, Response } from "express";

jest.mock("../../services/product.service");

describe("Product Controller", () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { role: "admin" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getAllProducts", () => {
    it("should return 200 on successful retrieval", async () => {
      mockReq.query = { page: "1", limit: "10" };
      (productService.getAllProducts as jest.Mock).mockResolvedValue({
        products: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      await productController.getAllProducts(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe("getProductById", () => {
    it("should return 200 on successful retrieval", async () => {
      mockReq.params = { id: "1" };
      (productService.getProductById as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Test Product",
      });

      await productController.getProductById(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 400 on invalid product id", async () => {
      mockReq.params = { id: "invalid" };

      await productController.getProductById(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 on NotFoundError", async () => {
      mockReq.params = { id: "1" };
      (productService.getProductById as jest.Mock).mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await productController.getProductById(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createProduct", () => {
    it("should return 201 on successful creation", async () => {
      mockReq.body = {
        name: "New Product",
        price: 100,
        stock: 10,
        category: "electronics",
        img: "test.jpg",
      };
      (productService.createProduct as jest.Mock).mockResolvedValue({
        id: 1,
        name: "New Product",
      });

      await productController.createProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 401 on UnauthorizedError", async () => {
      (productService.createProduct as jest.Mock).mockRejectedValue(
        new UnauthorizedError("Not authorized"),
      );

      await productController.createProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("updateProduct", () => {
    it("should return 200 on successful update", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { name: "Updated Product" };
      (productService.updateProduct as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Updated Product",
      });

      await productController.updateProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 404 on NotFoundError", async () => {
      mockReq.params = { id: "1" };
      (productService.updateProduct as jest.Mock).mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await productController.updateProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteProduct", () => {
    it("should return 204 on successful deletion", async () => {
      mockReq.params = { id: "1" };
      (productService.deleteProduct as jest.Mock).mockResolvedValue({
        id: 1,
        name: "Deleted Product",
      });

      await productController.deleteProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it("should return 404 on NotFoundError", async () => {
      mockReq.params = { id: "1" };
      (productService.deleteProduct as jest.Mock).mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await productController.deleteProduct(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
