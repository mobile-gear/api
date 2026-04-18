import * as checkoutController from "../../controllers/checkout.controller";
import checkoutService from "../../services/checkout.service";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../utils/errors";
import { Request, Response } from "express";

jest.mock("../../services/checkout.service");

describe("Checkout Controller", () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;
  let mockNext: () => void;

  beforeEach(() => {
    mockReq = {
      body: {},
      user: { id: 1 },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("createPaymentIntent", () => {
    it("should return 200 on successful creation", async () => {
      mockReq.body = {
        items: [{ productId: 1, quantity: 2 }],
      };
      (checkoutService.createPaymentIntent as jest.Mock).mockResolvedValue({
        clientSecret: "pi_test_secret",
        items: [{ productId: 1, quantity: 2 }],
        total: 200,
      });

      await checkoutController.createPaymentIntent(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 400 on BadRequestError", async () => {
      (checkoutService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new BadRequestError("Invalid items"),
      );

      await checkoutController.createPaymentIntent(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 on NotFoundError", async () => {
      (checkoutService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new NotFoundError("Product not found"),
      );

      await checkoutController.createPaymentIntent(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return 401 on UnauthorizedError", async () => {
      (checkoutService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new UnauthorizedError("Unauthorized"),
      );

      await checkoutController.createPaymentIntent(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should call next for non-HttpError", async () => {
      const error = new Error("Generic error");
      (checkoutService.createPaymentIntent as jest.Mock).mockRejectedValue(
        error,
      );

      await checkoutController.createPaymentIntent(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
