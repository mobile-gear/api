import orderItemRepository from "../../repositories/order-item.repository";
import { CartItem } from "../../models";

jest.mock("../../models");

describe("Order Item Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOne", () => {
    it("should create order item", async () => {
      const cartItemData = {
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 100,
      };
      const mockCartItem = { id: 1, ...cartItemData };
      (CartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const cartItem = await orderItemRepository.createOne(cartItemData);
      expect(cartItem).toEqual(mockCartItem);
      expect(CartItem.create).toHaveBeenCalledWith(cartItemData, {
        transaction: undefined,
      });
    });

    it("should create order item with transaction", async () => {
      const cartItemData = {
        orderId: 1,
        productId: 1,
        quantity: 2,
        price: 100,
      };
      const mockTransaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      } as never;
      const mockCartItem = { id: 1, ...cartItemData };
      (CartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const cartItem = await orderItemRepository.createOne(
        cartItemData,
        mockTransaction,
      );
      expect(cartItem).toEqual(mockCartItem);
      expect(CartItem.create).toHaveBeenCalledWith(cartItemData, {
        transaction: mockTransaction,
      });
    });

    it("should handle zero quantity", async () => {
      const cartItemData = {
        orderId: 1,
        productId: 1,
        quantity: 0,
        price: 0,
      };
      const mockCartItem = { id: 1, ...cartItemData };
      (CartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const cartItem = await orderItemRepository.createOne(cartItemData);
      expect(cartItem).toEqual(mockCartItem);
    });

    it("should handle large quantity", async () => {
      const cartItemData = {
        orderId: 1,
        productId: 1,
        quantity: 9999,
        price: 1000,
      };
      const mockCartItem = { id: 1, ...cartItemData };
      (CartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const cartItem = await orderItemRepository.createOne(cartItemData);
      expect(cartItem).toEqual(mockCartItem);
    });
  });
});
