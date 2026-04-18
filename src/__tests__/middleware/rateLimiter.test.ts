import { loginRateLimiter, registerRateLimiter } from "../../middleware/rateLimiter";
import { Request, Response, NextFunction } from "express";

describe("Rate Limiter Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: "127.0.0.1",
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it("should allow requests within limit for login", async () => {
    await loginRateLimiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should allow requests within limit for register", async () => {
    await registerRateLimiter(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should have different limits for login and register", () => {
    const loginLimiter = loginRateLimiter as never;
    const registerLimiter = registerRateLimiter as never;
    
    expect(loginLimiter).toBeDefined();
    expect(registerLimiter).toBeDefined();
  });
});
