import express from "express";
import authRouter from "../modules/auth/auth.route.js";
import dropsRouter from "../modules/drops/drops.route.js";
import reservationRouter from "../modules/reservation/reservation.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/drops", dropsRouter);
router.use("/reservations", reservationRouter);

export default router;
