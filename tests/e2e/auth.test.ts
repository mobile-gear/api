import request from "supertest";
import app from "@/server";
import { User } from "@/models";

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
