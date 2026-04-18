import checkoutService from "../../services/checkout.service";
import productRepository from "../../repositories/product.repository";
import productCache from "../../cache/strategies/product.cache";
import paymentRepository from "../../repositories/payment.repository";
import { BadRequestError } from "../../utils/errors";

jest.mock("../../repositories/product.repository");
jest.mock("../../cache/strategies/product.cache");
jest.mock("../../repositories/payment.repository");

describe("Checkout Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "test_key";
  });

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
  });

  describe("validateCart", () => {
    it("should throw error for invalid items array", async () => {
      await expect(checkoutService.validateCart(null as never)).rejects.toThrow(BadRequestError);
      await expect(checkoutService.validateCart("not array" as never)).rejects.toThrow(BadRequestError);
    });

    it("should return empty result for empty items array", async () => {
      const result = await checkoutService.validateCart([]);
      expect(result).toEqual({ items: [], total: 0 });
    });

    it("should throw error for invalid quantity", async () => {
      const items = [{ productId: 1, quantity: 0 }];
      const mockProduct = { id: 1, price: 100, stock: 10 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      
      await expect(checkoutService.validateCart(items)).rejects.toThrow(BadRequestError);
    });

    it("should throw error for negative quantity", async () => {
      const items = [{ productId: 1, quantity: -1 }];
      const mockProduct = { id: 1, price: 100, stock: 10 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      
      await expect(checkoutService.validateCart(items)).rejects.toThrow(BadRequestError);
    });

    it("should throw error for product not found", async () => {
      const items = [{ productId: 1, quantity: 2 }];
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map());
      (productRepository.getByIds as jest.Mock).mockResolvedValue([]);
      
      await expect(checkoutService.validateCart(items)).rejects.toThrow(BadRequestError);
    });

    it("should throw error for insufficient stock", async () => {
      const items = [{ productId: 1, quantity: 10 }];
      const mockProduct = { id: 1, price: 100, stock: 5 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      
      await expect(checkoutService.validateCart(items)).rejects.toThrow(BadRequestError);
    });

    it("should validate cart with cached products", async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, price: 100, stock: 10 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      
      const result = await checkoutService.validateCart(items);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(200);
      expect(productRepository.getByIds).not.toHaveBeenCalled();
    });

    it("should validate cart with database products when cache miss", async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, price: 100, stock: 10 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map());
      (productRepository.getByIds as jest.Mock).mockResolvedValue([mockProduct]);
      
      const result = await checkoutService.validateCart(items);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(200);
      expect(productRepository.getByIds).toHaveBeenCalledWith([1]);
      expect(productCache.setBulk).toHaveBeenCalled();
    });
  });

  describe("createPaymentIntent", () => {
    it("should create payment intent successfully", async () => {
      const items = [{ productId: 1, quantity: 2 }];
      const mockProduct = { id: 1, price: 100, stock: 10 };
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      (paymentRepository.createPaymentIntent as jest.Mock).mockResolvedValue({
        clientSecret: "pi_test_secret",
      });
      
      const result = await checkoutService.createPaymentIntent(items);
      expect(result).toHaveProperty("clientSecret");
    });
  });
});
