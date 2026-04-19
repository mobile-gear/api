import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";
import userRepository from "../repositories/user.repository";
import userCache from "../cache/strategies/user.cache";

const getUserWithoutPassword = (user: User) => {
  const { password, ...userWithoutPassword } = user.get({
    plain: true,
  }) as User;
  void password;
  return userWithoutPassword;
};

const register = async (userData: User) => {
  const { email, password, firstName, lastName } = userData;

  const existingUser = await userRepository.getOne({ email });
  if (existingUser)
    throw new BadRequestError("An account with this email already exists.");

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await userRepository.createOne({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role: "user",
  });

  const user = getUserWithoutPassword(newUser);
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "2h" },
  );

  return { token, user };
};

const login = async (email: string, password: string) => {
  const user = await userRepository.getOne({ email });
  if (!user) throw new UnauthorizedError("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError("Invalid credentials");

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "2h" },
  );

  return { token, user: getUserWithoutPassword(user) };
};

const getProfile = async (userId: number) => {
  if (!userId) throw new UnauthorizedError("Unauthorized");

  const cached = await userCache.getById(userId);
  if (cached) return getUserWithoutPassword(cached);

  const user = await userRepository.getOneById(userId);
  if (!user) throw new NotFoundError("User not found");

  await userCache.setById(userId, user);
  return getUserWithoutPassword(user);
};

export default {
  register,
  login,
  getProfile,
};
