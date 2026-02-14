import { Transaction } from "sequelize";
import { CartItem } from "../models";

const createOne = async (
  cartItem: Partial<CartItem>,
  transaction?: Transaction,
) => {
  const newCartItem = await CartItem.create(cartItem, { transaction });
  return newCartItem;
};

export default {
  createOne,
};
