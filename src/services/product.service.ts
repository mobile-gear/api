import { Product } from "../models";
import ProductQuery from "../interfaces/query/product";
import { NotFoundError } from "../utils/errors";
import productRepository from "../repositories/product.repository";
import { CreationAttributes } from "sequelize";
import productCache from "../cache/strategies/product.cache";

const getAllProducts = async (options: ProductQuery) => {
  // Try cache first
  const cached = await productCache.getList(options);
  if (cached) return cached;

  // Cache miss - fetch from DB
  const result = await productRepository.getAll(options);

  // Update cache
  await productCache.setList(options, result);
  return result;
};

const getProductById = async (id: number) => {
  // Try cache first
  const cached = await productCache.getById(id);
  if (cached) return cached;

  // Cache miss - fetch from DB
  const product = await productRepository.getOneById(id);
  if (!product) throw new NotFoundError(`Product with id ${id} not found`);

  // Update cache
  await productCache.setById(id, product);
  return product;
};

const createProduct = async (product: CreationAttributes<Product>) => {
  const newProduct = await productRepository.createOne(product);

  // Invalidate product lists cache (new product added)
  await productCache.invalidateAll();

  return newProduct;
};

const updateProduct = async (
  id: number,
  product: CreationAttributes<Product>,
) => {
  const updatedProduct = await productRepository.updateOneById(id, product);
  if (!updatedProduct)
    throw new NotFoundError(`Product with id ${id} not found`);

  // CRITICAL: Invalidate cache after update
  await productCache.invalidateById(id);

  return updatedProduct;
};

const deleteProduct = async (id: number) => {
  const product = await productRepository.deleteOneById(id);
  if (!product) throw new NotFoundError(`Product with id ${id} not found`);

  // CRITICAL: Invalidate cache after delete
  await productCache.invalidateById(id);
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
