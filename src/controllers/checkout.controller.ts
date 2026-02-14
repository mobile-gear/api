import { Request, Response, NextFunction } from "express";
import checkoutService from "../services/checkout.service";
import handleError from "../utils/handleError";

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await checkoutService.createPaymentIntent(req.body.items);
    res.json(result);
  } catch (error) {
    handleError(error, res, next);
  }
};
