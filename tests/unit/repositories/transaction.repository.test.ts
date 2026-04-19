import transactionRepository from "@/repositories/transaction.repository";
import db from "@/db/database";

jest.mock("@/db/database");

describe("Transaction Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOne", () => {
    it("should create database transaction", async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(mockTransaction);

      const transaction = await transactionRepository.createOne();
      expect(transaction).toEqual(mockTransaction);
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should create transaction with commit method", async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(mockTransaction);

      const transaction = await transactionRepository.createOne();
      expect(transaction).toHaveProperty("commit");
      expect(typeof transaction.commit).toBe("function");
    });

    it("should create transaction with rollback method", async () => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      (db.transaction as jest.Mock).mockResolvedValue(mockTransaction);

      const transaction = await transactionRepository.createOne();
      expect(transaction).toHaveProperty("rollback");
      expect(typeof transaction.rollback).toBe("function");
    });
  });
});
