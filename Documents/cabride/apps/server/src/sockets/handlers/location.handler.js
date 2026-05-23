import Driver from "../../models/Driver.model.js";
import DriverLocation from "../../models/DriverLocation.model.js";

/**
 * location:update  (driver emits)
 *  payload: { rideId, latitude, longitude, speed?, heading?, accuracy? }
 *
 * Server does two things:
 *  1. Updates Driver.currentLocation in DB (for "where is driver now")
 *  2. Saves a DriverLocation snapshot (for route history + TTL cleanup)
 *  3. Broadcasts to the ride room so customer map updates
 */
export const locationHandler = (io, socket) => {
  socket.on("location:update", async ({ rideId, latitude, longitude, speed, heading, accuracy }) => {
    try {
      const { driverId } = socket.data;
      if (!driverId) return;

      // 1. Update live location on Driver document
      await Driver.findByIdAndUpdate(driverId, {
        currentLocation:    { latitude, longitude },
        lastLocationUpdate: new Date(),
      });

      // 2. Save location snapshot
      await DriverLocation.create({
        driver:    driverId,
        ride:      rideId || null,
        latitude,
        longitude,
        speed:     speed    || null,
        heading:   heading  || null,
        accuracy:  accuracy || null,
      });

      // 3. Broadcast to ride room → customer sees driver moving on map
      io.to(`ride:${rideId}`).emit("location:update", {
        latitude,
        longitude,
        speed,
        heading,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("location:update error:", error.message);
    }
  });
};
