import ApiError from "../errors/ApiError.js";
import httpStatus from "http-status";

export default (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Forbidden: admin access required",
    );
  }
  next();
};
