import { BadRequestError, NotFoundError } from "../utils/errors";
import productRepository from "../repositories/product.repository";
import orderRepository from "../repositories/order.repository";
import cartItemsRepository from "../repositories/order-item.repository";
import transactionsRepository from "../repositories/transaction.repository";
import OrderDto from "../interfaces/dto/order";
import OrderQuery from "../interfaces/query/order";
import productCache from "../cache/strategies/product.cache";

const createOrder = async (orderData: OrderDto) => {
  const transaction = await transactionsRepository.createOne();

  try {
    const { items, totalAmount, paymentIntentId, shippingAddressId, userId } =
      orderData;

    // OPTIMIZATION: Batch fetch de productos
    const productIds = items.map((item) => item.productId);

    // Intentar obtener de cache
    const cachedProducts = await productCache.getBulk(productIds);
    const missingIds = productIds.filter((id) => !cachedProducts.has(id));

    // Fetch missing products from DB en una sola query
    let productMap = cachedProducts;
    if (missingIds.length > 0) {
      const dbProducts = await productRepository.getByIds(
        missingIds,
        transaction,
      );
      dbProducts.forEach((product) => productMap.set(product.id, product));

      // Cachear productos recién obtenidos
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

    // Ahora usar productMap en lugar de queries individuales
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

      // Invalidar cache (stock cambió)
      await productCache.invalidateById(item.productId);
    }

    await transaction.commit();
    return orderRepository.getOneById(order.id);
  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
};

const getAllOrders = async (options: OrderQuery) => {
  const orders = await orderRepository.getAll(options);
  return orders;
};

const getUserOrders = async (userId: number) => {
  const orders = await orderRepository.getAll({ userId });
  return orders;
};

const getOrderById = async (orderId: number, userId: number) => {
  const order = await orderRepository.getOne({
    id: orderId,
    userId,
  });

  if (!order) throw new NotFoundError("Order not found");

  return order;
};

const updateOrderStatus = async (orderId: number, status: string) => {
  const order = await orderRepository.updateOneById(orderId, { status });
  if (!order) throw new NotFoundError("Order not found");

  return order;
};

export default {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
};
