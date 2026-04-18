import orderService from "../../services/order.service";
import orderRepository from "../../repositories/order.repository";
import orderCache from "../../cache/strategies/order.cache";
import productCache from "../../cache/strategies/product.cache";
import transactionsRepository from "../../repositories/transaction.repository";
import productRepository from "../../repositories/product.repository";
import cartItemsRepository from "../../repositories/order-item.repository";
import { NotFoundError, BadRequestError } from "../../utils/errors";

jest.mock("../../repositories/product.repository");
jest.mock("../../repositories/order.repository");
jest.mock("../../repositories/order-item.repository");
jest.mock("../../repositories/transaction.repository");
jest.mock("../../cache/strategies/product.cache");
jest.mock("../../cache/strategies/order.cache");

describe("Order Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrderById", () => {
    it("should return order from cache", async () => {
      const mockOrder = { id: 1, userId: 1, total: 100 };
      (orderCache.getById as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderService.getOrderById(1, 1);
      expect(order).toEqual(mockOrder);
      expect(orderRepository.getOne).not.toHaveBeenCalled();
    });

    it("should return order from database if cache miss", async () => {
      const mockOrder = { id: 1, userId: 1, total: 100 };
      (orderCache.getById as jest.Mock).mockResolvedValue(null);
      (orderRepository.getOne as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderService.getOrderById(1, 1);
      expect(order).toEqual(mockOrder);
      expect(orderCache.setById).toHaveBeenCalledWith(1, mockOrder);
    });

    it("should throw NotFoundError if order not found", async () => {
      (orderCache.getById as jest.Mock).mockResolvedValue(null);
      (orderRepository.getOne as jest.Mock).mockResolvedValue(null);

      await expect(orderService.getOrderById(999, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if userId is not provided", async () => {
      await expect(orderService.getOrderById(1, 0 as never))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe("getUserOrders", () => {
    it("should return orders from cache", async () => {
      const mockResult = { orders: [{ id: 1 }], pagination: { total: 1 } };
      (orderCache.getList as jest.Mock).mockResolvedValue(mockResult);

      const orders = await orderService.getUserOrders(1);
      expect(orders).toEqual(mockResult);
      expect(orderRepository.getAll).not.toHaveBeenCalled();
    });

    it("should return orders from database if cache miss", async () => {
      const mockResult = { orders: [{ id: 1 }], pagination: { total: 1 } };
      (orderCache.getList as jest.Mock).mockResolvedValue(null);
      (orderRepository.getAll as jest.Mock).mockResolvedValue(mockResult);

      const orders = await orderService.getUserOrders(1);
      expect(orders).toEqual(mockResult);
      expect(orderCache.setList).toHaveBeenCalled();
    });
  });

  describe("getAllOrders", () => {
    it("should return all orders", async () => {
      const mockOrders = { orders: [{ id: 1 }], pagination: { total: 1 } };
      (orderRepository.getAll as jest.Mock).mockResolvedValue(mockOrders);

      const orders = await orderService.getAllOrders({});
      expect(orders).toEqual(mockOrders);
    });
  });

  describe("createOrder", () => {
    it("should create order successfully with cache hit", async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        totalAmount: 200,
        paymentIntentId: "pi_test",
        shippingAddressId: 1,
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockProduct = { id: 1, price: 100, stock: 10 };
      const mockOrder = { id: 1, userId: 1, total: 200 };
      
      (transactionsRepository.createOne as jest.Mock).mockResolvedValue(mockTransaction);
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      (orderRepository.createOne as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepository.getOneById as jest.Mock).mockResolvedValue(mockOrder);
      (cartItemsRepository.createOne as jest.Mock).mockResolvedValue({});
      (productRepository.updateOneById as jest.Mock).mockResolvedValue(mockProduct);

      const order = await orderService.createOrder(orderData);
      expect(order).toEqual(mockOrder);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it("should create order with cache miss", async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        totalAmount: 200,
        paymentIntentId: "pi_test",
        shippingAddressId: 1,
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockProduct = { id: 1, price: 100, stock: 10 };
      const mockOrder = { id: 1, userId: 1, total: 200 };
      
      (transactionsRepository.createOne as jest.Mock).mockResolvedValue(mockTransaction);
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map());
      (productRepository.getByIds as jest.Mock).mockResolvedValue([mockProduct]);
      (orderRepository.createOne as jest.Mock).mockResolvedValue(mockOrder);
      (orderRepository.getOneById as jest.Mock).mockResolvedValue(mockOrder);
      (cartItemsRepository.createOne as jest.Mock).mockResolvedValue({});
      (productRepository.updateOneById as jest.Mock).mockResolvedValue(mockProduct);

      const order = await orderService.createOrder(orderData);
      expect(order).toEqual(mockOrder);
      expect(productRepository.getByIds).toHaveBeenCalled();
      expect(productCache.setBulk).toHaveBeenCalled();
    });

    it("should rollback transaction on insufficient stock", async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 1, quantity: 10 }],
        totalAmount: 1000,
        paymentIntentId: "pi_test",
        shippingAddressId: 1,
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockProduct = { id: 1, price: 100, stock: 5 };
      
      (transactionsRepository.createOne as jest.Mock).mockResolvedValue(mockTransaction);
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      (orderRepository.createOne as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(orderService.createOrder(orderData)).rejects.toThrow(BadRequestError);
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should rollback transaction on error", async () => {
      const orderData = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        totalAmount: 200,
        paymentIntentId: "pi_test",
        shippingAddressId: 1,
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      const mockProduct = { id: 1, price: 100, stock: 10 };
      
      (transactionsRepository.createOne as jest.Mock).mockResolvedValue(mockTransaction);
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, mockProduct]]));
      (orderRepository.createOne as jest.Mock).mockRejectedValue(new Error("DB error"));

      await expect(orderService.createOrder(orderData)).rejects.toThrow("DB error");
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it("should throw BadRequestError if insufficient stock", async () => {
      const orderData = {
        items: [{ productId: 1, quantity: 100 }],
        userId: 1,
        totalAmount: 1000,
        paymentIntentId: "pi_test",
      };
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      (transactionsRepository.createOne as jest.Mock).mockResolvedValue(mockTransaction);
      (productCache.getBulk as jest.Mock).mockResolvedValue(new Map([[1, { id: 1, stock: 5 }]]));
      (orderRepository.createOne as jest.Mock).mockResolvedValue({ id: 1, userId: 1 });

      await expect(orderService.createOrder(orderData as never))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe("updateOrderStatus", () => {
    it("should update order status", async () => {
      const mockOrder = { id: 1, userId: 1, status: "shipped" };
      (orderRepository.updateOneById as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderService.updateOrderStatus(1, "shipped");
      expect(order).toEqual(mockOrder);
      expect(orderCache.invalidateById).toHaveBeenCalledWith(1);
      expect(orderCache.invalidateUserOrders).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundError if order not found", async () => {
      (orderRepository.updateOneById as jest.Mock).mockResolvedValue(null);

      await expect(orderService.updateOrderStatus(999, "shipped")).rejects.toThrow(NotFoundError);
    });
  });
});
