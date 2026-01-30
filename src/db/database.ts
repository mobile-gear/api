import pg from "pg";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const db = new Sequelize(process.env.DB_URL ?? "", {
  dialect: "postgres",
  dialectModule: pg,
  logging: false,
  query: { raw: true },
});

export default db;
