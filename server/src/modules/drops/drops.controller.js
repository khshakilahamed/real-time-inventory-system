import catchAsyncErrors from "../../errors/catchAsyncErrors.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import { createNewMerchDropService, getDropsService } from "./drops.service.js";

export const createNewMerchDropController = catchAsyncErrors(
  async (req, res) => {
    const data = req.body;
    const result = await createNewMerchDropService(data);

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Successfully created drop",
      data: result,
    });
  },
);

export const getDropsController = catchAsyncErrors(
  async (req, res) => {
    const result = await getDropsService();

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Successfully retrieved data",
      data: result,
    });
  },
);
