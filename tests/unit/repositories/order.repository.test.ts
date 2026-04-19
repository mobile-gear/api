import orderRepository from "@/repositories/order.repository";
import { Order } from "@/models";

jest.mock("@/models");

describe("Order Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return orders with pagination", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({ userId: 1 });
      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it("should filter by status", async () => {
      const mockOrders = [
        { id: 1, userId: 1, total: 100, status: "completed" },
      ];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        status: "completed",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by minTotal", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        minTotal: "50",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by maxTotal", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        maxTotal: "200",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by minTotal and maxTotal", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        minTotal: "50",
        maxTotal: "200",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by startDate", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        startDate: "2024-01-01",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by endDate", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        endDate: "2024-12-31",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should filter by startDate and endDate", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      });
      expect(result.orders).toEqual(mockOrders);
    });

    it("should use default sortBy when invalid field provided", async () => {
      const mockOrders = [{ id: 1, userId: 1, total: 100 }];
      (Order.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: mockOrders,
      });

      const result = await orderRepository.getAll({
        userId: 1,
        sortBy: "invalid",
      });
      expect(result.orders).toEqual(mockOrders);
    });
  });

  describe("getOne", () => {
    it("should return order by id and userId", async () => {
      const mockOrder = { id: 1, userId: 1, total: 100 };
      (Order.findOne as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderRepository.getOne({ id: 1, userId: 1 });
      expect(order).toEqual(mockOrder);
      expect(Order.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
        include: [{ model: expect.any(Function), as: "items" }],
      });
    });

    it("should return null if order not found", async () => {
      (Order.findOne as jest.Mock).mockResolvedValue(null);

      const order = await orderRepository.getOne({ id: 999, userId: 1 });
      expect(order).toBeNull();
    });
  });

  describe("createOne", () => {
    it("should create order", async () => {
      const orderData = {
        userId: 1,
        total: 100,
        status: "completed",
        paymentIntentId: "pi_test",
        shippingAddressId: 1,
      };
      const mockOrder = { id: 1, ...orderData };
      (Order.create as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderRepository.createOne(orderData);
      expect(order).toEqual(mockOrder);
      expect(Order.create).toHaveBeenCalledWith(orderData, {
        transaction: undefined,
      });
    });
  });

  describe("updateOneById", () => {
    it("should update order", async () => {
      const updateData = { status: "shipped" };
      const mockOrder = {
        id: 1,
        status: "shipped",
        update: jest.fn().mockResolvedValue(undefined),
      };
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const order = await orderRepository.updateOneById(1, updateData);
      expect(order).toEqual(mockOrder);
      expect(mockOrder.update).toHaveBeenCalledWith(updateData);
    });

    it("should return null if order not found", async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      const order = await orderRepository.updateOneById(999, {
        status: "shipped",
      });
      expect(order).toBeNull();
    });
  });
});
