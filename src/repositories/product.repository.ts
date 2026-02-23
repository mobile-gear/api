import { CreationAttributes, Op, Transaction, WhereOptions } from "sequelize";
import { Product } from "../models";
import ProductQuery from "../interfaces/query/product";
import { SortOrder } from "../types/common";

const VALID_SORT_FIELDS = [
  "id",
  "name",
  "price",
  "category",
  "stock",
  "createdAt",
] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];

const getAll = async (options: ProductQuery) => {
  const {
    category,
    minPrice,
    maxPrice,
    outOfStock,
    sortBy,
    sortOrder,
    page = 1,
    limit = 10,
    searchTerm,
  } = options;

  const where: WhereOptions = {};

  if (category) where.category = category;

  if (searchTerm)
    where.name = {
      [Op.iLike]: `%${searchTerm}%`,
    };

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  if (outOfStock) {
    if (outOfStock === "yes") where.stock[Op.eq] = 0;
    if (outOfStock === "no") where.stock[Op.gt] = 0;
  }

  let order: [string, string][] = [["createdAt", "DESC"]];
  if (
    sortBy &&
    VALID_SORT_FIELDS.includes(sortBy as SortField) &&
    (sortOrder === SortOrder.ASC || sortOrder === SortOrder.DESC)
  ) {
    order = [[sortBy as string, sortOrder.toUpperCase()]];
  }

  const pageNum = Math.max(1, page);
  const limitNum = Math.max(1, Math.min(50, limit));
  const offset = (pageNum - 1) * limitNum;

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    order,
    limit: limitNum,
    offset: offset,
  });
  return { pagination: { count, limit: limitNum, page: pageNum }, products };
};

const getOneById = async (id: number, transaction?: Transaction) => {
  const product = await Product.findByPk(id, { transaction });
  return product;
};

const createOne = async (
  product: CreationAttributes<Product>,
  transaction?: Transaction,
) => {
  const newProduct = await Product.create(product, { transaction });
  return newProduct;
};

const updateOneById = async (
  id: number,
  product: Partial<CreationAttributes<Product>>,
  transaction?: Transaction,
) => {
  const updatedProduct = await getOneById(id);
  if (!updatedProduct) return null;
  await updatedProduct.update(product, { transaction });
  return updatedProduct;
};

const deleteOneById = async (id: number) => {
  const product = await getOneById(id);
  if (!product) return null;
  await product.destroy();
  return product;
};

export default {
  getAll,
  getOneById,
  createOne,
  updateOneById,
  deleteOneById,
};
