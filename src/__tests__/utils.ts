import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import User from "../models/User";
import Product from "../models/Product";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.test" });

export const testSequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.TEST_DB_NAME || "mobilegear_test",
  logging: false,
  models: [path.join(__dirname, "../models")],
  query: { raw: true },
});

export async function resetDatabase() {
  try {
    await testSequelize.drop({ cascade: true });
    await testSequelize.sync({ force: true });

    const migrationSql = fs.readFileSync(
      path.resolve(__dirname, "../db/migrations/001_initial_schema.sql"),
      "utf8",
    );

    if (migrationSql.trim()) {
      await testSequelize.query(migrationSql);
    }
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

export async function insertTestData() {
  try {
    const hashedPassword = await bcrypt.hash("testHashedPassword", 10);

    const testUsers = [
      {
        email: "admin@test.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
      {
        email: "user@test.com",
        password: hashedPassword,
        firstName: "Regular",
        lastName: "User",
        role: "user",
      },
    ];

    await User.bulkCreate(testUsers);

    const testProducts = [
      {
        name: "Test Phone",
        description: "A test smartphone",
        price: 599.99,
        category: "smartphone",
        stock: 50,
        img: "",
      },
      {
        name: "Test Tablet",
        description: "A test tablet",
        price: 399.99,
        category: "tablets",
        stock: 30,
        img: "",
      },
      {
        name: "Test Laptop",
        description: "A test laptop",
        price: 999.99,
        category: "laptop",
        stock: 20,
        img: "",
      },
    ];

    await Product.bulkCreate(testProducts);
  } catch (error) {
    console.error("Error inserting test data:", error);
    throw error;
  }
}

export async function closeDatabase() {
  try {
    await testSequelize.close();
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error;
  }
}
