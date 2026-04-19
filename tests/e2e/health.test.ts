import request from "supertest";
import app from "@/server";

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
