import jwt from "jsonwebtoken";
import { UserModel } from "../models/index.js";
import httpStatus from "http-status";
import ApiError from "../errors/ApiError.js";

export default async (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "No token provided");
  }
  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    const user = await UserModel.findByPk(payload.id);
    if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
