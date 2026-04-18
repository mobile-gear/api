import pg from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const isTest = process.env.NODE_ENV === "test";

const db = isTest
  ? new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    })
  : new Sequelize(process.env.DB_URL ?? "", {
      dialect: "postgres",
      dialectModule: pg,
      logging: false,
    });

export default db;
