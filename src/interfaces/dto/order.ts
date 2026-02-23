import CartItemDto from "./cart-item";

export default interface OrderDto {
  items: CartItemDto[];
  totalAmount: number;
  paymentIntentId: string;
  shippingAddressId: number;
  userId: number;
}
