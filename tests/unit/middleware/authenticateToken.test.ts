import authenticateToken from "@/middleware/authenticateToken";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Authenticate Token Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    process.env.JWT_SECRET = "test_secret";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("should send 401 if no token provided", async () => {
    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should send 401 if cookies is undefined", async () => {
    mockReq.cookies = undefined;
    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should send 403 if token is invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });
    mockReq.cookies = { token: "invalid_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next if token is valid", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({
      userId: 1,
      email: "test@example.com",
    });
    mockReq.cookies = { token: "valid_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toEqual({ userId: 1, email: "test@example.com" });
  });

  it("should use fallback secret when JWT_SECRET is not set", async () => {
    delete process.env.JWT_SECRET;
    (jwt.verify as jest.Mock).mockReturnValue({
      userId: 1,
      email: "test@example.com",
    });
    mockReq.cookies = { token: "valid_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(jwt.verify).toHaveBeenCalledWith("valid_token", "fallback_secret");
    expect(mockNext).toHaveBeenCalled();
  });

  it("should send 403 if token is expired", async () => {
    const error = new Error("Token expired") as Error & { name: string };
    error.name = "TokenExpiredError";
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw error;
    });
    mockReq.cookies = { token: "expired_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should send 403 if token is malformed", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("jwt malformed");
    });
    mockReq.cookies = { token: "malformed_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should set req.user with correct properties when token is valid", async () => {
    const mockUser = { id: 123, email: "user@example.com", role: "user" };
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
    mockReq.cookies = { token: "valid_token" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.user).toEqual(mockUser);
    expect(typeof mockReq.user.id).toBe("number");
    expect(typeof mockReq.user.email).toBe("string");
    expect(typeof mockReq.user.role).toBe("string");
  });

  it("should handle empty string token", async () => {
    mockReq.cookies = { token: "" };

    await authenticateToken(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
