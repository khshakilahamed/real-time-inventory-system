import express from "express";
import authenticate from "../../middlewares/authenticate.js";
import {
  deleteReservationController,
  getAllReservationController,
  purchaseReservationController,
} from "./reservation.controller.js";
import requireAdmin from "../../middlewares/requireAdmin.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { getReservationSchema } from "./reservation.validate.js";

const reservationRouter = express.Router();

reservationRouter.get(
  "/",
  authenticate,
  requireAdmin,
  validateRequest(getReservationSchema),
  getAllReservationController,
);
reservationRouter.delete("/:id", authenticate, deleteReservationController);
reservationRouter.post(
  "/:id/purchase",
  authenticate,
  purchaseReservationController,
);

export default reservationRouter;
