import request from "supertest";
import app from "../server";
import { Product, User } from "../models";

describe("API Health Check", () => {
  it("should respond with 404 for unknown routes", async () => {
    const response = await request(app).get("/api/unknown");
    expect(response.status).toBe(404);
  });

  it("should respond with cache status", async () => {
    const response = await request(app).get("/api/cache/status");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("enabled");
    expect(response.body).toHaveProperty("stats");
  });
});

describe("API Routes", () => {
  it("should have products routes available", async () => {
    const response = await request(app).get("/api/products");
    expect([200]).toContain(response.status);
  });

  it("should have orders routes available", async () => {
    const response = await request(app).get("/api/orders");
    expect([401]).toContain(response.status);
  });

  it("should have checkout routes available", async () => {
    const response = await request(app).get("/api/checkout/create-payment-intent");
    expect([401]).toContain(response.status);
  });
});

describe("Auth Endpoints Integration", () => {
  let userToken: string;
  let userId: number;
  let testEmail: string;

  beforeAll(async () => {
    testEmail = `test${Date.now()}@example.com`;
  });

  it("should register a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    expect([200, 201]).toContain(response.status);
    if ([200, 201].includes(response.status)) {
      userToken = response.body.token;
      userId = response.body.user.id;
    }
  });

  it("should login with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "password123",
    });
    expect([200]).toContain(response.status);
    if (response.status === 200) {
      userToken = response.body.token;
      userId = response.body.user.id;
    }
  });

  it("should get profile with token", async () => {
    if (!userToken) {
      return;
    }
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Cookie", `token=${userToken}`);
    expect([200]).toContain(response.status);
  });

  it("should fail get profile without token", async () => {
    const response = await request(app).get("/api/auth/profile");
    expect([401]).toContain(response.status);
  });

  it("should fail login with invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nonexistent@example.com",
      password: "wrongpassword",
    });
    expect([401]).toContain(response.status);
  });

  it("should fail register with existing email", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: testEmail,
      password: "password123",
      firstName: "Test",
      lastName: "User",
    });
    expect([400]).toContain(response.status);
  });

  afterAll(async () => {
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
  });
});

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

    const adminUser = await User.create({
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

describe("Orders Endpoints Integration", () => {
  let userToken: string;
  let userId: number;
  let productId: number;

  beforeAll(async () => {
    const registerResponse = await request(app).post("/api/auth/register").send({
      email: `orderuser${Date.now()}@example.com`,
      password: "password123",
      firstName: "Order",
      lastName: "User",
    });
    if (registerResponse.status === 200 || registerResponse.status === 201) {
      userToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    }

    const product = await Product.create({
      name: "Order Product",
      description: "For testing orders",
      price: 50,
      stock: 20,
      category: "electronics",
      img: "order.jpg",
    });
    productId = product.id;
  });

  afterAll(async () => {
    if (productId) {
      await Product.destroy({ where: { id: productId } });
    }
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
  });

  it("should get user orders with token", async () => {
    if (!userToken) return;
    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", `token=${userToken}`);
    expect([200]).toContain(response.status);
  });

  it("should fail get orders without token", async () => {
    const response = await request(app).get("/api/orders");
    expect([401]).toContain(response.status);
  });

  it("should get order by id with token", async () => {
    if (!userToken) return;
    const response = await request(app)
      .get("/api/orders/1")
      .set("Cookie", `token=${userToken}`);
    expect([200]).toContain(response.status);
  });

  it("should fail get order by id without token", async () => {
    const response = await request(app).get("/api/orders/1");
    expect([401]).toContain(response.status);
  });
});

describe("Checkout Endpoints Integration", () => {
  let userToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    if (loginResponse.status === 200) {
      userToken = loginResponse.body.token;
    }
  });

  it("should create payment intent with token", async () => {
    if (!userToken) return;
    const response = await request(app)
      .post("/api/checkout/create-payment-intent")
      .set("Cookie", `token=${userToken}`)
      .send({
        items: [{ productId: 1, quantity: 2 }],
      });
    expect([200]).toContain(response.status);
  });

  it("should fail create payment intent without token", async () => {
    const response = await request(app).post("/api/checkout/create-payment-intent").send({
      items: [{ productId: 1, quantity: 2 }],
    });
    expect([401]).toContain(response.status);
  });
});
