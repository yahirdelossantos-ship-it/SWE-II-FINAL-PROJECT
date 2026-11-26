import { Router } from "express";

import authRouter from "./auth";
import catalogRouter from "./catalog";
import { requireV2Auth } from "./core/auth";
import { success, v2ErrorHandler } from "./core/http";
import itineraryRouter from "./itineraries";
import serviceRouter from "./services";
import importRouter from "./imports";

const router = Router();

router.get("/", (_req, res) =>
	success(res, { name: "MB Transfer API", version: 2 }),
);
router.use("/auth", authRouter);
router.use(requireV2Auth);
router.use("/catalog", catalogRouter);
router.use("/itineraries", itineraryRouter);
router.use("/imports", importRouter);
router.use("/services", serviceRouter);
router.use(v2ErrorHandler);

export default router;
