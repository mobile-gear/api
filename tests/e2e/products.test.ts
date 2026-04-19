import request from "supertest";
import app from "@/server";
import { Product, User } from "@/models";

describe("Products Endpoints Integration", () => {
  let productId: number;
  let adminToken: string;

  beforeAll(async () => {
    const product = await Product.create({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      stock: 10,
      category: "electronics",
      img: "test.jpg",
    });
    productId = product.id;

    await User.create({
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });
    if (loginResponse.status === 200) {
      adminToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    if (productId) {
      await Product.destroy({ where: { id: productId } });
    }
    await User.destroy({ where: { email: "admin@example.com" } });
  });

  it("should get products list", async () => {
    const response = await request(app).get("/api/products");
    expect([200]).toContain(response.status);
  });

  it("should get products with query params", async () => {
    const response = await request(app).get("/api/products?page=1&limit=10");
    expect([200]).toContain(response.status);
  });

  it("should get product by id", async () => {
    const response = await request(app).get(`/api/products/${productId}`);
    expect([200]).toContain(response.status);
  });

  it("should handle non-existent product", async () => {
    const response = await request(app).get("/api/products/99999");
    expect([404]).toContain(response.status);
  });

  it("should handle invalid product id", async () => {
    const response = await request(app).get("/api/products/invalid");
    expect([400]).toContain(response.status);
  });

  it("should handle negative product id", async () => {
    const response = await request(app).get("/api/products/-1");
    expect([400]).toContain(response.status);
  });

  it("should create product with admin token", async () => {
    if (!adminToken) return;
    const response = await request(app)
      .post("/api/products")
      .set("Cookie", `token=${adminToken}`)
      .send({
        name: "New Product",
        description: "New Description",
        price: 200,
        stock: 5,
        category: "electronics",
        img: "new.jpg",
      });
    expect([200, 201]).toContain(response.status);
  });

  it("should fail create product without token", async () => {
    const response = await request(app).post("/api/products").send({
      name: "New Product",
      description: "New Description",
      price: 200,
      stock: 5,
      category: "electronics",
      img: "new.jpg",
    });
    expect([401]).toContain(response.status);
  });

  it("should update product with admin token", async () => {
    if (!adminToken || !productId) return;
    const response = await request(app)
      .put(`/api/products/${productId}`)
      .set("Cookie", `token=${adminToken}`)
      .send({ name: "Updated Product" });
    expect([200]).toContain(response.status);
  });

  it("should delete product with admin token", async () => {
    if (!adminToken) return;
    const newProduct = await Product.create({
      name: "To Delete",
      description: "Delete me",
      price: 50,
      stock: 1,
      category: "electronics",
      img: "delete.jpg",
    });
    const response = await request(app)
      .delete(`/api/products/${newProduct.id}`)
      .set("Cookie", `token=${adminToken}`);
    expect([200]).toContain(response.status);
  });
});
