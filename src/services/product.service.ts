import { Product } from "../models";
import ProductQuery from "../interfaces/query/product";
import { ConflictError, NotFoundError } from "../utils/errors";
import { ForeignKeyConstraintError } from "sequelize";
import productRepository from "../repositories/product.repository";
import { CreationAttributes } from "sequelize";
import productCache from "../cache/strategies/product.cache";

const getAllProducts = async (options: ProductQuery) => {
  const cached = await productCache.getList(options);
  if (cached) return cached;

  const result = await productRepository.getAll(options);

  await productCache.setList(options, result);
  return result;
};

const getProductById = async (id: number) => {
  const cached = await productCache.getById(id);
  if (cached) return cached;

  const product = await productRepository.getOneById(id);
  if (!product) throw new NotFoundError(`Product with id ${id} not found`);

  await productCache.setById(id, product);
  return product;
};

const createProduct = async (product: CreationAttributes<Product>) => {
  const newProduct = await productRepository.createOne(product);

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

  await productCache.invalidateById(id);

  return updatedProduct;
};

const deleteProduct = async (id: number) => {
  try {
    const product = await productRepository.deleteOneById(id);
    if (!product) throw new NotFoundError(`Product with id ${id} not found`);

    await productCache.invalidateById(id);
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError)
      throw new ConflictError("Cannot delete product because it has associated orders");
    throw error;
  }
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
