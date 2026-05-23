import { Router } from "express";
import {
  createBooking,
  getBookingById,
  getUserBookings,
  updateBookingStatus,
} from "../controllers/booking.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect); // all booking routes require auth

router.post  ("/",           restrictTo("customer"), validate(["pickup", "dropoff"]), createBooking);
router.get   ("/",           getUserBookings);
router.get   ("/:id",        getBookingById);
router.patch ("/:id/status", restrictTo("driver"), validate(["status"]), updateBookingStatus);

export default router;
