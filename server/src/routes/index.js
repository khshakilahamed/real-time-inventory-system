import express from "express";
import authRouter from "../modules/auth/auth.route.js";
import dropsRouter from "../modules/drops/drops.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/drops", dropsRouter);

export default router;
