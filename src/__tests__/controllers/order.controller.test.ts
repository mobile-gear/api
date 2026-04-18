import * as orderController from "../../controllers/order.controller";
import orderService from "../../services/order.service";
import { NotFoundError, UnauthorizedError } from "../../utils/errors";
import { Request, Response } from "express";

jest.mock("../../services/order.service");

describe("Order Controller", () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { id: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getUserOrders", () => {
    it("should return 200 on successful retrieval", async () => {
      (orderService.getUserOrders as jest.Mock).mockResolvedValue({
        orders: [],
        pagination: { page: 1, limit: 10, total: 0 },
      });

      await orderController.getUserOrders(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 404 on NotFoundError", async () => {
      (orderService.getUserOrders as jest.Mock).mockRejectedValue(new NotFoundError("User not found"));

      await orderController.getUserOrders(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getOrderById", () => {
    it("should return 200 on successful retrieval", async () => {
      mockReq.params = { id: "1" };
      (orderService.getOrderById as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        total: 100,
      });

      await orderController.getOrderById(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 404 on NotFoundError", async () => {
      mockReq.params = { id: "1" };
      (orderService.getOrderById as jest.Mock).mockRejectedValue(new NotFoundError("Order not found"));

      await orderController.getOrderById(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 401 on UnauthorizedError", async () => {
      mockReq.params = { id: "1" };
      (orderService.getOrderById as jest.Mock).mockRejectedValue(new UnauthorizedError("Not authorized"));

      await orderController.getOrderById(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("createOrder", () => {
    it("should return 201 on successful creation", async () => {
      mockReq.body = {
        items: [{ productId: 1, quantity: 2 }],
        totalAmount: 200,
      };
      (orderService.createOrder as jest.Mock).mockResolvedValue({
        id: 1,
        userId: 1,
        total: 200,
      });

      await orderController.createOrder(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 400 on BadRequestError", async () => {
      const { BadRequestError } = require("../../utils/errors");
      (orderService.createOrder as jest.Mock).mockRejectedValue(new BadRequestError("Invalid order data"));

      await orderController.createOrder(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateOrderStatus", () => {
    it("should return 200 on successful update", async () => {
      mockReq.params = { id: "1" };
      mockReq.body = { status: "shipped" };
      (orderService.updateOrderStatus as jest.Mock).mockResolvedValue({
        id: 1,
        status: "shipped",
      });

      await orderController.updateOrderStatus(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 404 on NotFoundError", async () => {
      mockReq.params = { id: "1" };
      (orderService.updateOrderStatus as jest.Mock).mockRejectedValue(new NotFoundError("Order not found"));

      await orderController.updateOrderStatus(mockReq as unknown as Request, mockRes as unknown as Response, jest.fn());
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});
