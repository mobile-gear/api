import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import handleError from "../utils/handleError";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  maxAge: 2 * 60 * 60 * 1000,
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token, user } = await authService.register(req.body);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({ user });
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
    const { token, user } = await authService.login(email, password);
    res.cookie("token", token, cookieOptions);
    res.json({ user });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
  });
  res.status(200).json({ message: "Logged out" });
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
