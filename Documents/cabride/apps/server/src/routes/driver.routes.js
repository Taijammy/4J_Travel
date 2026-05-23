import { Router } from "express";
import { getAvailableDrivers, updateDriverStatus } from "../controllers/driver.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);

router.get  ("/available",  getAvailableDrivers);
router.patch("/status",     restrictTo("driver"), validate(["isAvailable"]), updateDriverStatus);

export default router;
