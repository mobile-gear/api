import { Transaction } from "sequelize";
import { OrderItem } from "../models";

const createOne = async (
  orderItem: Partial<OrderItem>,
  transaction?: Transaction,
) => {
  const newOrderItem = await OrderItem.create(orderItem, { transaction });
  return newOrderItem;
};

export default {
  createOne,
};
