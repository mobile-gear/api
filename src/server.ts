import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";
import orderRoutes from "./routes/orders.routes";
import checkoutRoutes from "./routes/checkout.routes";
import authenticateToken from "./middleware/authenticateToken";
import db from "./db/database";
import RedisClient from "./cache/redis.client";
import cacheMetrics from "./cache/cache.metrics";
import { warmUpCache } from "./cache/cache.warmup";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", authenticateToken, orderRoutes);
app.use("/api/checkout", authenticateToken, checkoutRoutes);

app.get("/api/cache/status", (_req, res) => {
  const stats = cacheMetrics.getStats();
  res.json({
    enabled: RedisClient.isEnabled(),
    stats,
  });
});

app.use((_err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: "Internal server error" });
});

export async function startServer() {
  await db.sync({ force: false });
  await warmUpCache();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

export default app;