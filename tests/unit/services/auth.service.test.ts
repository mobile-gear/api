import authService from "@/services/auth.service";
import userRepository from "@/repositories/user.repository";
import userCache from "@/cache/strategies/user.cache";
import bcrypt from "bcryptjs";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";

jest.mock("@/repositories/user.repository");
jest.mock("@/cache/strategies/user.cache");
jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn().mockResolvedValue("hashed_password"),
    compare: jest.fn().mockResolvedValue(true),
  },
}));

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test_secret";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe("register", () => {
    it("should register new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };
      const newUser = {
        id: 1,
        ...userData,
        password: "hashed_password",
        role: "user",
        get: jest.fn().mockReturnValue({
          plain: () => ({
            id: 1,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            role: "user",
          }),
        }),
      };
      (userRepository.getOne as jest.Mock).mockResolvedValue(null);
      (userRepository.createOne as jest.Mock).mockResolvedValue(newUser);

      const result = await authService.register(userData as never);
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw BadRequestError if email already exists", async () => {
      (userRepository.getOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        } as never),
      ).rejects.toThrow(BadRequestError);
    });

    it("should use fallback secret when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      };
      const newUser = {
        id: 1,
        ...userData,
        password: "hashed_password",
        role: "user",
        get: jest.fn().mockReturnValue({
          plain: () => ({
            id: 1,
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            role: "user",
          }),
        }),
      };
      (userRepository.getOne as jest.Mock).mockResolvedValue(null);
      (userRepository.createOne as jest.Mock).mockResolvedValue(newUser);

      const result = await authService.register(userData as never);
      expect(result).toHaveProperty("token");
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        role: "user",
        get: jest.fn().mockReturnValue({
          plain: () => ({ id: 1, email: "test@example.com", role: "user" }),
        }),
      };
      (userRepository.getOne as jest.Mock).mockResolvedValue(user);

      const result = await authService.login("test@example.com", "password123");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedError if user not found", async () => {
      (userRepository.getOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login("test@example.com", "password123"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if password is invalid", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        get: jest.fn().mockReturnValue({
          plain: () => ({ id: 1, email: "test@example.com" }),
        }),
      };
      (userRepository.getOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await expect(
        authService.login("test@example.com", "wrongpassword"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should use fallback secret when JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;
      const user = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        role: "user",
        get: jest.fn().mockReturnValue({
          plain: () => ({ id: 1, email: "test@example.com", role: "user" }),
        }),
      };
      (userRepository.getOne as jest.Mock).mockResolvedValue(user);

      const result = await authService.login("test@example.com", "password123");
      expect(result).toHaveProperty("token");
    });
  });

  describe("getProfile", () => {
    it("should get user profile from cache", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        password: "password123",
        get: jest.fn().mockReturnValue({
          plain: () => ({ id: 1, email: "test@example.com" }),
        }),
      };
      (userCache.getById as jest.Mock).mockResolvedValue(user);

      const result = await authService.getProfile(1);
      expect(result).not.toHaveProperty("password");
      expect(userRepository.getOneById).not.toHaveBeenCalled();
    });

    it("should get user profile from database if cache miss", async () => {
      const user = {
        id: 1,
        email: "test@example.com",
        password: "password123",
        get: jest.fn().mockReturnValue({
          plain: () => ({ id: 1, email: "test@example.com" }),
        }),
      };
      (userCache.getById as jest.Mock).mockResolvedValue(null);
      (userRepository.getOneById as jest.Mock).mockResolvedValue(user);

      const result = await authService.getProfile(1);
      expect(result).not.toHaveProperty("password");
      expect(userCache.setById).toHaveBeenCalledWith(1, user);
    });

    it("should throw UnauthorizedError if userId is not provided", async () => {
      await expect(authService.getProfile(0 as never)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("should throw NotFoundError if user not found in cache or DB", async () => {
      (userCache.getById as jest.Mock).mockResolvedValue(null);
      (userRepository.getOneById as jest.Mock).mockResolvedValue(null);

      await expect(authService.getProfile(1)).rejects.toThrow(NotFoundError);
    });
  });
});
