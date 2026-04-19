import userRepository from "@/repositories/user.repository";
import { User } from "@/models";

jest.mock("@/models");

describe("User Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOne", () => {
    it("should return user by email", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const user = await userRepository.getOne({ email: "test@example.com" });
      expect(user).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalled();
    });

    it("should return null if user not found", async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const user = await userRepository.getOne({
        email: "nonexistent@example.com",
      });
      expect(user).toBeNull();
    });
  });

  describe("getOneById", () => {
    it("should return user by id", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

      const user = await userRepository.getOneById(1);
      expect(user).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith(1);
    });

    it("should return null if user not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const user = await userRepository.getOneById(999);
      expect(user).toBeNull();
    });
  });

  describe("createOne", () => {
    it("should create user", async () => {
      const userData = {
        email: "test@example.com",
        password: "hashed",
        firstName: "Test",
        lastName: "User",
        role: "user",
      };
      const mockUser = { id: 1, ...userData };
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const user = await userRepository.createOne(userData);
      expect(user).toEqual(mockUser);
      expect(User.create).toHaveBeenCalledWith(userData);
    });
  });
});
