import { Product } from "../models";
import ProductQuery from "../interfaces/query/product";
import { NotFoundError } from "../utils/errors";
import productRepository from "../repositories/product.repository";
import { CreationAttributes } from "sequelize";

const getAllProducts = async (options: ProductQuery) => {
  return productRepository.getAll(options);
};

const getProductById = async (id: number) => {
  const product = await productRepository.getOneById(id);
  if (!product) throw new NotFoundError(`Product with id ${id} not found`);

  return product;
};

const createProduct = async (product: CreationAttributes<Product>) => {
  const newProduct = await productRepository.createOne(product);
  return newProduct;
};

const updateProduct = async (id: number, product: CreationAttributes<Product>) => {
  const updatedProduct = await productRepository.updateOneById(id, product);
  if (!updatedProduct)
    throw new NotFoundError(`Product with id ${id} not found`);
  return updatedProduct;
};

const deleteProduct = async (id: number) => {
  const product = await productRepository.deleteOneById(id);
  if (!product) throw new NotFoundError(`Product with id ${id} not found`);
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
