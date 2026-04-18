import express from "express";
import {
  getProfile,
  login,
  logout,
  register,
} from "../controllers/auth.controller";
import authenticateToken from "../middleware/authenticateToken";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rateLimiter";

const router = express.Router();

router.post("/register", registerRateLimiter, register);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);
router.get("/profile", authenticateToken, getProfile);

export default router;
