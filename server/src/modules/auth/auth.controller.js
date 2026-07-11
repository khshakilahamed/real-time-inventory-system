import catchAsyncErrors from "../../errors/catchAsyncErrors.js";
import sendResponse from "../../shared/sendResponse.js";
import { loginService, registrationService } from "./user.service.js";
import httpStatus from 'http-status';

export const registrationController = catchAsyncErrors(async (req, res) => {
  const userInfo = req.body;
  const result = await registrationService(userInfo);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Registration Successful",
    data: result,
  });
});

export const loginController = catchAsyncErrors(async (req, res) => {
  const credentials = req.body;
  const result = await loginService(credentials);

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logged in",
    data: result,
  });
});
