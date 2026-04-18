import handleError from "../../utils/handleError";
import { HttpError, BadRequestError, NotFoundError, UnauthorizedError } from "../../utils/errors";
import { Response, NextFunction } from "express";

describe("handleError", () => {
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle HttpError correctly", () => {
    const error = new BadRequestError("Bad request");

    handleError(error, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad request" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle NotFoundError correctly", () => {
    const error = new NotFoundError("Not found");

    handleError(error, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle UnauthorizedError correctly", () => {
    const error = new UnauthorizedError("Unauthorized");

    handleError(error, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next for non-HttpError", () => {
    const error = new Error("Generic error");

    handleError(error, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
