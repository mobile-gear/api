import { Request, Response, NextFunction } from "express";
import productService from "../services/product.service";
import handleError from "../utils/handleError";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { products, pagination } = await productService.getAllProducts(
      req.query,
    );
    res.json({ products, pagination });
  } catch (error) {
    return handleError(error, res, next);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productService.getProductById(+req.params.id);
    res.json(product);
  } catch (error) {
    return handleError(error, res, next);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    return handleError(error, res, next);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await productService.updateProduct(
      +req.params.id,
      req.body,
    );
    res.json(product);
  } catch (error) {
    return handleError(error, res, next);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await productService.deleteProduct(+req.params.id);
    res.status(204).send();
  } catch (error) {
    return handleError(error, res, next);
  }
};
