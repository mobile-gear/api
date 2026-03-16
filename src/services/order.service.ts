import { BadRequestError, NotFoundError } from "../utils/errors";
import productRepository from "../repositories/product.repository";
import orderRepository from "../repositories/order.repository";
import cartItemsRepository from "../repositories/order-item.repository";
import transactionsRepository from "../repositories/transaction.repository";
import OrderDto from "../interfaces/dto/order";
import OrderQuery from "../interfaces/query/order";
import productCache from "../cache/strategies/product.cache";
import orderCache from "../cache/strategies/order.cache";

const createOrder = async (orderData: OrderDto) => {
  const transaction = await transactionsRepository.createOne();

  try {
    const { items, totalAmount, paymentIntentId, shippingAddressId, userId } =
      orderData;

    const productIds = items.map((item) => item.productId);

    const cachedProducts = await productCache.getBulk(productIds);
    const missingIds = productIds.filter((id) => !cachedProducts.has(id));

    let productMap = cachedProducts;
    if (missingIds.length > 0) {
      const dbProducts = await productRepository.getByIds(
        missingIds,
        transaction,
      );
      dbProducts.forEach((product) => productMap.set(product.id, product));

      const newProductsMap = new Map(dbProducts.map((p) => [p.id, p]));
      await productCache.setBulk(newProductsMap);
    }

    const order = await orderRepository.createOne(
      {
        userId,
        total: totalAmount,
        status: "completed",
        paymentIntentId,
        shippingAddressId,
      },
      transaction,
    );

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product || product.stock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for product ${item.productId}`,
        );
      }

      await cartItemsRepository.createOne(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        },
        transaction,
      );

      await productRepository.updateOneById(
        item.productId,
        { stock: product.stock - item.quantity },
        transaction,
      );

      await productCache.invalidateById(item.productId);
    }

    await transaction.commit();

    await orderCache.invalidateUserOrders(userId);

    const createdOrder = await orderRepository.getOneById(order.id);
    if (createdOrder) await orderCache.setById(order.id, createdOrder);
    return createdOrder;
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

const getAllOrders = async (options: OrderQuery) => {
  return orderRepository.getAll(options);
};

const getUserOrders = async (userId: number) => {
  const query: OrderQuery = { userId };

  const cached = await orderCache.getList(query);
  if (cached) return cached;

  const result = await orderRepository.getAll(query);
  await orderCache.setList(query, result);
  return result;
};

const getOrderById = async (orderId: number, userId: number) => {
  const cached = await orderCache.getById(orderId);
  if (cached) return cached;

  const order = await orderRepository.getOne({ id: orderId, userId });
  if (!order) throw new NotFoundError("Order not found");

  await orderCache.setById(orderId, order);
  return order;
};

const updateOrderStatus = async (orderId: number, status: string) => {
  const order = await orderRepository.updateOneById(orderId, { status });
  if (!order) throw new NotFoundError("Order not found");

  await orderCache.invalidateById(orderId);
  await orderCache.invalidateUserOrders(order.userId);

  return order;
};

export default {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
