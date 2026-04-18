import * as authController from "../../controllers/auth.controller";
import authService from "../../services/auth.service";
import { BadRequestError } from "../../utils/errors";
import handleError from "../../utils/handleError";
import { Request, Response } from "express";

jest.mock("../../services/auth.service");
jest.mock("../../utils/handleError");

describe("Auth Controller", () => {
  let mockReq: Record<string, unknown>;
  let mockRes: Record<string, unknown>;
  let mockNext: () => void;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = "test_secret";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe("register", () => {
    it("should return 201 on successful registration", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };
      (authService.register as jest.Mock).mockResolvedValue({
        token: "jwt_token",
        user: { id: 1, email: "test@example.com" },
      });

      await authController.register(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 400 on BadRequestError", async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new BadRequestError("Email already exists"),
      );
      (handleError as jest.Mock).mockImplementation((error, res) => {
        res.status(error.statusCode).json({ message: error.message });
      });

      await authController.register(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        mockNext,
      );
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return 200 on successful login", async () => {
      mockReq.body = {
        email: "test@example.com",
        password: "password123",
      };
      (authService.login as jest.Mock).mockResolvedValue({
        token: "jwt_token",
        user: { id: 1, email: "test@example.com" },
      });

      await authController.login(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 401 on invalid credentials", async () => {
      const { UnauthorizedError } = require("../../utils/errors");
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedError("Invalid credentials"),
      );
      (handleError as jest.Mock).mockImplementation((error, res) => {
        res.status(error.statusCode).json({ message: error.message });
      });

      await authController.login(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe("getProfile", () => {
    it("should return 200 on successful profile retrieval", async () => {
      mockReq.user = { id: 1 };
      (authService.getProfile as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });

      await authController.getProfile(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should return 404 on NotFoundError", async () => {
      const { NotFoundError } = require("../../utils/errors");
      mockReq.user = { id: 1 };
      (authService.getProfile as jest.Mock).mockRejectedValue(
        new NotFoundError("User not found"),
      );
      (handleError as jest.Mock).mockImplementation((error, res) => {
        res.status(error.statusCode).json({ message: error.message });
      });

      await authController.getProfile(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
        jest.fn(),
      );
      expect(handleError).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should clear cookie and return 200", () => {
      authController.logout(
        mockReq as unknown as Request,
        mockRes as unknown as Response,
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        "token",
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        }),
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Logged out" });
    });
  });
});
