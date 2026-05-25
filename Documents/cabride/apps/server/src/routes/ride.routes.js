import { Router } from "express";
import {
  requestRide,
  getMyActiveRide,
  getRideById,
  getRideHistory,
  getPendingRides,
  acceptRideRequest,
  updateStatus,
  cancelRideRequest,
} from "../controllers/ride.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);

// ── Named routes MUST come before /:id ───────────────
router.post("/",         restrictTo("customer"), validate(["pickup", "dropoff"]), requestRide);
router.get  ("/active",  getMyActiveRide);
router.get  ("/history", getRideHistory);
router.get  ("/pending", restrictTo("driver"), getPendingRides);

// ── Param routes last ─────────────────────────────────
router.get   ("/:id",          getRideById);
router.patch ("/:id/accept",   restrictTo("driver"), acceptRideRequest);
router.patch ("/:id/status",   restrictTo("driver"), validate(["status"]), updateStatus);
router.patch ("/:id/cancel",   cancelRideRequest);

export default router;