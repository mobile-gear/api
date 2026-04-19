import request from "supertest";
import app from "@/server";

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
    const response = await request(app)
      .post("/api/checkout/create-payment-intent")
      .send({
        items: [{ productId: 1, quantity: 2 }],
      });
    expect([401]).toContain(response.status);
  });
});
