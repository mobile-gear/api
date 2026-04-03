export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super(404, message, details);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad request", details?: unknown) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(401, message, details);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Conflict", details?: unknown) {
    super(409, message, details);
    this.name = "ConflictError";
  }
}
