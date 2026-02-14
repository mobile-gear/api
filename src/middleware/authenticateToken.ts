import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";

export default async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret",
    ) as {
      id: number;
      email: string;
      role: string;
    };

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};
