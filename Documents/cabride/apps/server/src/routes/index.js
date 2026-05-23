import { Router } from "express";
import authRoutes    from "./auth.routes.js";
import bookingRoutes from "./booking.routes.js";
import driverRoutes  from "./driver.routes.js";
import rideRoutes    from "./ride.routes.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CabRide API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.use("/auth",     authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/drivers",  driverRoutes);
router.use("/rides",    rideRoutes);

export default router;
