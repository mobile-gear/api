export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Resource not found", details?: any) {
    super(404, message, details);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad request", details?: any) {
    super(400, message, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized", details?: any) {
    super(401, message, details);
    this.name = "UnauthorizedError";
  }
}
