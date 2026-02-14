import request from "supertest";
import app from "../server";
import { resetDatabase, insertTestData, closeDatabase } from "./utils";
import jwt from "jsonwebtoken";
import { beforeAll, describe, it, expect, afterAll } from "@jest/globals";

beforeAll(async () => {
  await resetDatabase();
  await insertTestData();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Product Routes", () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    adminToken = jwt.sign(
      { id: 1, email: "admin@test.com", role: "admin" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" },
    );
    userToken = jwt.sign(
      { id: 2, email: "user@test.com", role: "user" },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" },
    );
  });

  describe("GET /api/products", () => {
    it("should retrieve all products", async () => {
      const response = await request(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should filter products by category", async () => {
      const response = await request(app)
        .get("/api/products?category=smartphone")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.every((p: any) => p.category === "smartphone")).toBe(
        true,
      );
    });
  });

  describe("GET /api/products/:id", () => {
    it("should retrieve a single product", async () => {
      const response = await request(app)
        .get("/api/products/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("id", 1);
    });

    it("should return 404 for non-existent product", async () => {
      const response = await request(app)
        .get("/api/products/999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product (admin only)", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "New Test Product",
          description: "Test Description",
          price: 299.99,
          category: "smartphone",
          stock: 10,
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty("name", "New Test Product");
    });

    it("should reject product creation for non-admin users", async () => {
      const response = await request(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "New Test Product",
          description: "Test Description",
          price: 299.99,
          category: "smartphone",
          stock: 10,
        });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should update a product (admin only)", async () => {
      const response = await request(app)
        .put("/api/products/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Updated Product Name",
          price: 399.99,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("name", "Updated Product Name");
      expect(response.body).toHaveProperty("price", 399.99);
    });

    it("should reject product update for non-admin users", async () => {
      const response = await request(app)
        .put("/api/products/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "Updated Product Name",
        });

      expect(response.statusCode).toBe(403);
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product (admin only)", async () => {
      const response = await request(app)
        .delete("/api/products/2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.statusCode).toBe(200);
    });

    it("should reject product deletion for non-admin users", async () => {
      const response = await request(app)
        .delete("/api/products/3")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.statusCode).toBe(403);
    });
  });
});
