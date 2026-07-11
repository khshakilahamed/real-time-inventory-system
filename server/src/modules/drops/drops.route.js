import express from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { createDropSchema } from "./drops.validate.js";
import {
  createNewMerchDropController,
  getDropsController,
  reservationController,
} from "./drops.controller.js";
import authenticate from "../../middlewares/authenticate.js";
import requireAdmin from "../../middlewares/requireAdmin.js";

const dropsRouter = express.Router();

dropsRouter.post(
  "/",
  validateRequest(createDropSchema),
  authenticate,
  requireAdmin,
  createNewMerchDropController,
);

dropsRouter.get("/", getDropsController);
dropsRouter.post("/:dropId/reserve", authenticate, reservationController);

export default dropsRouter;
