import httpStatus from "http-status";
import ApiError from "../errors/ApiError.js";
import handleZodError from "../errors/handleZodError.js";
import { ZodError } from "zod";

export default (err, req, res, next) => {
  let errorMessages = [];
  let statusCode = 500;
  let message = "Internal server error";

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = httpStatus.CONFLICT;
    message = "Username or email already taken";
  } else if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  } else if (err instanceof ApiError) {
    statusCode = err?.statusCode;
    message = err?.message;
    errorMessages = err?.message
      ? [
          {
            path: "",
            message: err?.message,
          },
        ]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    errorMessages: errorMessages,
  });
};
