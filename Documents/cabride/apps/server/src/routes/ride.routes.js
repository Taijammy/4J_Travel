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

// All ride routes require auth
router.use(protect);

// ── Customer routes ───────────────────────────────────
router.post("/",   restrictTo("customer"), validate(["pickup", "dropoff"]), requestRide);

// ── Shared routes (customer + driver) ────────────────
router.get("/active",  getMyActiveRide);
router.get("/history", getRideHistory);
router.get("/:id",     getRideById);

// ── Driver only routes ────────────────────────────────
router.get  ("/pending",        restrictTo("driver"), getPendingRides);
router.patch("/:id/accept",     restrictTo("driver"), acceptRideRequest);
router.patch("/:id/status",     restrictTo("driver"), validate(["status"]), updateStatus);

// ── Both can cancel ───────────────────────────────────
router.patch("/:id/cancel", cancelRideRequest);

export default router;
