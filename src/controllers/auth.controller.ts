import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import handleError from "../utils/handleError";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userData = req.body;
    const user = await authService.register(userData);
    res.status(201).json(user);
  } catch (error) {
    handleError(error, res, next);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    handleError(error, res, next);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json(user);
  } catch (error) {
    handleError(error, res, next);
  }
};
