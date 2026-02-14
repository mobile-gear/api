import { CartItem } from "../interfaces/cart-item";
import paymentRepository from "../repositories/payment.repository";
import productRepository from "../repositories/product.repository";
import { BadRequestError } from "../utils/errors";

const validateCart = async (items: CartItem[]) => {
  if (!items || !Array.isArray(items))
    throw new BadRequestError("Invalid items array");

  const validatedItems = [];
  let total = 0;

  for (const item of items) {
    const product = await productRepository.getOneById(item.productId);

    if (!product)
      throw new BadRequestError(`Product with id ${item.productId} not found`);

    if (item.quantity <= 0)
      throw new BadRequestError(
        `Invalid quantity for product ${item.productId}`,
      );

    if (product.stock < item.quantity)
      throw new BadRequestError(
        `Insufficient stock for product ${item.productId}`,
      );

    validatedItems.push({
      ...item,
      price: product.price,
      subtotal: product.price * item.quantity,
    });

    total += product.price * item.quantity;
  }

  return {
    items: validatedItems,
    total,
  };
};

const createPaymentIntent = async (items: CartItem[]) => {
  const { items: validatedItems, total } = await validateCart(items);

  const paymentIntent = await paymentRepository.createPaymentIntent(
    validatedItems,
    total,
  );

  return paymentIntent;
};

export default {
  validateCart,
  createPaymentIntent,
};
