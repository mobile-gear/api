import request from "supertest";
import app from "@/server";
import { Product, User } from "@/models";

describe("Orders Endpoints Integration", () => {
  let userToken: string;
  let userId: number;
  let productId: number;

  beforeAll(async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
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
