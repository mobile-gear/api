import { HttpError, NotFoundError, BadRequestError, UnauthorizedError, ConflictError } from "../../utils/errors";

describe("Error Classes", () => {
  describe("HttpError", () => {
    it("should create HttpError with message", () => {
      const error = new HttpError(500, "Server error");
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Server error");
      expect(error.name).toBe("HttpError");
    });

    it("should create HttpError with message and details", () => {
      const details = { field: "email" };
      const error = new HttpError(500, "Server error", details);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Server error");
      expect(error.details).toEqual(details);
    });
  });

  describe("NotFoundError", () => {
    it("should create NotFoundError with default message", () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Resource not found");
      expect(error.name).toBe("NotFoundError");
    });

    it("should create NotFoundError with custom message", () => {
      const error = new NotFoundError("Product not found");
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Product not found");
    });

    it("should create NotFoundError with details", () => {
      const details = { id: 1 };
      const error = new NotFoundError("Product not found", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("BadRequestError", () => {
    it("should create BadRequestError with default message", () => {
      const error = new BadRequestError();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Bad request");
      expect(error.name).toBe("BadRequestError");
    });

    it("should create BadRequestError with custom message", () => {
      const error = new BadRequestError("Invalid email");
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid email");
    });

    it("should create BadRequestError with details", () => {
      const details = { field: "email" };
      const error = new BadRequestError("Invalid email", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
      expect(error.name).toBe("UnauthorizedError");
    });

    it("should create UnauthorizedError with custom message", () => {
      const error = new UnauthorizedError("Invalid token");
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Invalid token");
    });

    it("should create UnauthorizedError with details", () => {
      const details = { token: "expired" };
      const error = new UnauthorizedError("Invalid token", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("ConflictError", () => {
    it("should create ConflictError with default message", () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Conflict");
      expect(error.name).toBe("ConflictError");
    });

    it("should create ConflictError with custom message", () => {
      const error = new ConflictError("Email already exists");
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe("Email already exists");
    });

    it("should create ConflictError with details", () => {
      const details = { field: "email" };
      const error = new ConflictError("Email already exists", details);
      expect(error.details).toEqual(details);
    });
  });
});
