import { Op, Transaction, WhereOptions } from "sequelize";
import { Order, CartItem } from "../models";
import { OrderQuery } from "../interfaces/order";

const getAll = async (options: OrderQuery = {}) => {
  const {
    status,
    minTotal,
    maxTotal,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    userId,
  } = options;

  const where: WhereOptions = {
    userId,
  };

  if (status) where.status = status;

  if (minTotal || maxTotal) {
    where.total = {};
    if (minTotal) where.total[Op.gte] = Number(minTotal);
    if (maxTotal) where.total[Op.lte] = Number(maxTotal);
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const pageNumber = Math.max(1, Number(page));
  const itemsPerPage = Math.max(1, Math.min(50, Number(limit)));
  const offset = (pageNumber - 1) * itemsPerPage;

  const allowedSortFields = ["id", "createdAt", "status", "total"];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const validSortOrder = sortOrder?.toLowerCase() === "asc" ? "ASC" : "DESC";

  const { count, rows: orders } = await Order.findAndCountAll({
    where,
    include: [{ model: CartItem, as: "items" }],
    limit: itemsPerPage,
    offset: offset,
    order: [[validSortBy, validSortOrder]],
  });

  return {
    orders,
    pagination: {
      total: count,
      totalPages: Math.ceil(count / itemsPerPage),
      page: pageNumber,
      limit: itemsPerPage,
    },
  };
};

const getOne = async (options: OrderQuery) => {
  const { id, userId } = options;

  const where: WhereOptions = {
    userId,
  };

  if (id) where.id = id;

  const order = await Order.findOne({
    where,
    include: [{ model: CartItem, as: "items" }],
  });
  return order;
};

const getOneById = async (id: number, transaction?: Transaction) => {
  const order = await Order.findByPk(id, {
    include: [{ model: CartItem, as: "items" }],
    transaction,
  });
  return order;
};

const createOne = async (order: Partial<Order>, transaction?: Transaction) => {
  const newOrder = await Order.create(order, { transaction });
  return newOrder;
};

const updateOneById = async (id: number, order: Partial<Order>) => {
  const updatedOrder = await getOneById(id);
  if (!updatedOrder) return null;
  await updatedOrder.update(order);
  return updatedOrder;
};

export default { getAll, getOneById, getOne, createOne, updateOneById };
