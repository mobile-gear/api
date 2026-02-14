import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ServerlessHttp from "serverless-http";

import authRoutes from "../routes/auth.routes";
import productRoutes from "../routes/products.routes";
import orderRoutes from "../routes/orders.routes";
import checkoutRoutes from "../routes/checkout.routes";
import authenticateToken from "../middleware/authenticateToken";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/.netlify/functions/server/api/auth", authRoutes);
app.use("/.netlify/functions/server/api/products", productRoutes);
app.use(
  "/.netlify/functions/server/api/orders",
  authenticateToken,
  orderRoutes,
);
app.use(
  "/.netlify/functions/server/api/checkout",
  authenticateToken,
  checkoutRoutes,
);

export const handler = ServerlessHttp(app);
