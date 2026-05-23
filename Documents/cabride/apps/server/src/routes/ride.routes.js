import { Router } from "express";
import { getRideById, completeRide } from "../controllers/ride.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get  ("/:id",          getRideById);
router.patch("/:id/complete", restrictTo("driver"), completeRide);

export default router;
