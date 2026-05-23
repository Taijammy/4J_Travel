import { Router } from "express";
import {
  getAvailableDrivers,
  getDriverProfile,
  goOnline,
  goOffline,
  updateAvailability,
  updateVehicleInfo,
} from "../controllers/driver.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// All driver routes require authentication
router.use(protect);

// ── Any logged-in user ────────────────────────────────
router.get("/available", getAvailableDrivers);

// ── Driver only ───────────────────────────────────────
router.get  ("/profile",      restrictTo("driver"), getDriverProfile);
router.patch("/online",       restrictTo("driver"), goOnline);
router.patch("/offline",      restrictTo("driver"), goOffline);
router.patch("/availability", restrictTo("driver"), validate(["isAvailable"]), updateAvailability);
router.patch("/vehicle",      restrictTo("driver"), updateVehicleInfo);

export default router;
