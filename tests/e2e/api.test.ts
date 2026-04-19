import request from "supertest";
import app from "@/server";

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
    const response = await request(app).get(
      "/api/checkout/create-payment-intent",
    );
    expect([401]).toContain(response.status);
  });
});
