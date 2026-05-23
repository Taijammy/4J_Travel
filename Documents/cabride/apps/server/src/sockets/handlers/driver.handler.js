import Driver from "../../models/Driver.model.js";

/**
 * DRIVER PRESENCE HANDLER
 *
 * Driver emits:
 *   driver:online      → marks online + available in DB
 *   driver:offline     → marks offline + unavailable in DB
 *   driver:ping        → heartbeat every 30s to confirm still connected
 */
export const driverHandler = (io, socket) => {

  /**
   * driver:online
   * Driver app signals they are ready to accept rides
   * payload: { driverId }
   */
  socket.on("driver:online", async ({ driverId }) => {
    try {
      socket.data.driverId = driverId;
      socket.join("drivers:pool"); // room of all available drivers

      await Driver.findByIdAndUpdate(driverId, {
        isOnline:    true,
        isAvailable: true,
      });

      socket.emit("driver:status", {
        isOnline:    true,
        isAvailable: true,
        message:     "You are now online",
        timestamp:   Date.now(),
      });

      console.log(`🟢 Driver online: ${driverId}`);
    } catch (error) {
      console.error("driver:online error:", error.message);
    }
  });

  /**
   * driver:offline
   * Driver app signals they are going offline
   * payload: { driverId }
   */
  socket.on("driver:offline", async ({ driverId }) => {
    try {
      socket.leave("drivers:pool");

      await Driver.findByIdAndUpdate(driverId, {
        isOnline:    false,
        isAvailable: false,
      });

      socket.emit("driver:status", {
        isOnline:    false,
        isAvailable: false,
        message:     "You are now offline",
        timestamp:   Date.now(),
      });

      console.log(`🔴 Driver offline: ${driverId}`);
    } catch (error) {
      console.error("driver:offline error:", error.message);
    }
  });

  /**
   * driver:ping
   * Heartbeat — driver app sends every 30s to stay marked online
   * Server responds with pong
   */
  socket.on("driver:ping", ({ driverId }) => {
    socket.emit("driver:pong", { timestamp: Date.now() });
  });

  // ── Auto mark offline on disconnect ──────────────────
  socket.on("disconnect", async () => {
    const { driverId, role } = socket.data;
    if (role === "driver" && driverId) {
      try {
        await Driver.findByIdAndUpdate(driverId, {
          isOnline:    false,
          isAvailable: false,
        });
        console.log(`🔴 Driver auto-offline on disconnect: ${driverId}`);
      } catch (error) {
        console.error("driver disconnect cleanup error:", error.message);
      }
    }
  });
};
