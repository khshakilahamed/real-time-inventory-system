import ApiError from "../../errors/ApiError.js";
import httpStatus from "http-status";
import bcrypt from "bcryptjs";
import { UserModel } from "../../models/User.js";
import jwt from "jsonwebtoken";

export const registrationService = async (userInfo) => {
  const { firstName, lastName, email, password } = userInfo;

  const isExistUser = await UserModel.findOne({
    where: {
      email: email,
    },
    raw: true,
  });

  if (isExistUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exist.");
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    firstName,
    lastName,
    email,
    passwordHash: hash,
  });

  const { passwordHash, ...others } = user;
  console.log("others: ", others);

  return others;
};

export const loginService = async (credentials) => {
  const { email, password } = credentials;

  const user = await UserModel.findOne({
    where: {
      email: email,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.CONFLICT, "User not found.");
  }

  if (!(await user.validatePassword(password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid credentials");
  }

  const userData = user.get({ plain: true });
  const token = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    token,
    user: {
      id: userData.id,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
    },
  };
};
