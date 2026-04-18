import { beforeAll, afterAll } from "@jest/globals";
import db from "./db/database";

beforeAll(async () => {
  console.log("Test suite starting...");
  await db.sync({ force: true });
});

afterAll(async () => {
  console.log("Test suite completed");
  await db.close();
});
