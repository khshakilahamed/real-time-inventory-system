import catchAsyncErrors from "../../errors/catchAsyncErrors.js";
import sendResponse from "../../shared/sendResponse.js";
import httpStatus from "http-status";
import {
  deleteReservationService,
  getAllReservationService,
  purchaseReservationService,
} from "./reservation.service.js";

export const getAllReservationController = catchAsyncErrors(
  async (req, res) => {
    const { status } = req.query;
    const result = await getAllReservationService(status);

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reservations retrieved",
      data: result,
    });
  },
);

export const deleteReservationController = catchAsyncErrors(
  async (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.id;
    await deleteReservationService(req, userId, reservationId);

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Reservation cancelled",
    });
  },
);

export const purchaseReservationController = catchAsyncErrors(
  async (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const result = await purchaseReservationService(req, userId, reservationId);

    return sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Purchase completed",
      data: result,
    });
  },
);
