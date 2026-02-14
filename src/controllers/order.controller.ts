import { Request, Response, NextFunction } from "express";
import handleError from "../utils/handleError";
import orderService from "../services/order.service";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user!.id,
    };
    const order = await orderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    handleError(error, res, next);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const filters = {
      ...req.query,
      userId: req.user!.id,
    };
    const { orders, pagination } = await orderService.getAllOrders(filters);
    res.json({ orders, pagination });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
  } catch (error) {
    handleError(error, res, next);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await orderService.getOrderById(+req.params.id, req.user!.id);
    res.json(order);
  } catch (error) {
    handleError(error, res, next);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const order = await orderService.updateOrderStatus(
      +req.params.id,
      req.body.status,
    );
    res.json(order);
  } catch (error) {
    handleError(error, res, next);
  }
};
