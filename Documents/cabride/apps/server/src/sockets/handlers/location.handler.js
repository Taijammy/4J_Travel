import Driver        from "../../models/Driver.model.js";
import DriverLocation from "../../models/DriverLocation.model.js";

/**
 * LOCATION HANDLER
 *
 * Driver emits every ~3 seconds:
 *   location:update → server saves to DB + broadcasts to ride room
 *
 * Customer receives:
 *   location:update → moves driver marker on Leaflet map
 */
export const locationHandler = (io, socket) => {

  /**
   * location:update
   * Driver sends live coordinates
   * payload: { rideId, latitude, longitude, speed?, heading?, accuracy? }
   */
  socket.on("location:update", async (payload) => {
    try {
      const { rideId, latitude, longitude, speed, heading, accuracy } = payload;
      const { driverId } = socket.data;

      // Basic validation
      if (!latitude || !longitude) {
        return socket.emit("error", { message: "latitude and longitude are required" });
      }
      if (latitude < -90  || latitude > 90 ||
          longitude < -180 || longitude > 180) {
        return socket.emit("error", { message: "Invalid coordinates" });
      }
      if (!driverId) {
        return socket.emit("error", { message: "Driver not identified. Reconnect with driverId query param." });
      }

      // 1. Update Driver document with latest location
      await Driver.findByIdAndUpdate(driverId, {
        currentLocation:    { latitude, longitude },
        lastLocationUpdate: new Date(),
      });

      // 2. Save snapshot to DriverLocation (TTL: auto-deleted after 1hr)
      await DriverLocation.create({
        driver:   driverId,
        ride:     rideId || null,
        latitude,
        longitude,
        speed:    speed    ?? null,
        heading:  heading  ?? null,
        accuracy: accuracy ?? null,
      });

      // 3. Broadcast to all sockets in the ride room
      if (rideId) {
        io.to(`ride:${rideId}`).emit("location:update", {
          latitude,
          longitude,
          speed:     speed    ?? null,
          heading:   heading  ?? null,
          timestamp: Date.now(),
        });
      }

      // 4. Ack back to driver (confirms receipt)
      socket.emit("location:ack", { timestamp: Date.now() });

    } catch (error) {
      console.error("location:update error:", error.message);
      socket.emit("error", { message: "Failed to update location" });
    }
  });

  /**
   * location:request
   * Customer requests the latest driver location immediately
   * (useful on first load before next interval fires)
   * payload: { rideId, driverId }
   */
  socket.on("location:request", async ({ driverId }) => {
    try {
      const latest = await DriverLocation.getLatest(driverId);
      if (latest) {
        socket.emit("location:update", {
          latitude:  latest.latitude,
          longitude: latest.longitude,
          speed:     latest.speed,
          heading:   latest.heading,
          timestamp: latest.recordedAt.getTime(),
        });
      }
    } catch (error) {
      console.error("location:request error:", error.message);
    }
  });
};
