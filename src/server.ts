import express from "express";
import cors from "cors";
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

app.use(cors());
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

db.sync({ force: false }).then(async () => {
  await warmUpCache();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
