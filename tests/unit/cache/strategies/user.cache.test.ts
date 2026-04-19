import userCache from "@/cache/strategies/user.cache";
import CacheService from "@/cache/cache.service";

jest.mock("@/cache/cache.service");
jest.mock("@/cache/utils/key-builder");

describe("User Cache Strategy", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getById", () => {
    it("should get user by id", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(mockUser);

      const user = await userCache.getById(1);
      expect(user).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      (CacheService.prototype.get as jest.Mock).mockResolvedValue(null);

      const user = await userCache.getById(1);
      expect(user).toBeNull();
    });
  });

  describe("setById", () => {
    it("should set user by id", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (CacheService.prototype.set as jest.Mock).mockResolvedValue(undefined);

      await userCache.setById(1, mockUser as never);
      expect(CacheService.prototype.set).toHaveBeenCalled();
    });
  });

  describe("invalidateById", () => {
    it("should invalidate user by id", async () => {
      (CacheService.prototype.delete as jest.Mock).mockResolvedValue(undefined);

      await userCache.invalidateById(1);
      expect(CacheService.prototype.delete).toHaveBeenCalled();
    });
  });
});
