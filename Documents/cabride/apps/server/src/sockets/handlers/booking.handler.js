import Ride from "../../models/Ride.model.js";
import Driver from "../../models/Driver.model.js";

/**
 * Socket events — booking & ride lifecycle
 *
 * Customer emits:  ride:request      → broadcast to available drivers
 * Customer emits:  ride:cancel       → notify driver, cancel ride
 * Customer emits:  ride:subscribe    → join ride room to track driver
 *
 * Driver emits:    ride:accept       → notify customer, create Ride doc
 * Driver emits:    ride:arriving     → notify customer driver is close
 * Driver emits:    ride:start        → ride has begun
 * Driver emits:    ride:complete     → ride finished
 */
export const bookingHandler = (io, socket) => {

  // ── Customer requests a ride ────────────────────────
  socket.on("ride:request", (data) => {
    console.log("ride:request →", data);
    socket.broadcast.emit("ride:incoming", data);
  });

  // ── Customer joins ride room to receive location ────
  socket.on("ride:subscribe", ({ rideId }) => {
    socket.join(`ride:${rideId}`);
    console.log(`Socket ${socket.id} subscribed to ride:${rideId}`);
  });

  // ── Driver accepts ride ─────────────────────────────
  socket.on("ride:accept", async ({ rideId, driverId }) => {
    try {
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { driver: driverId, status: "accepted" },
        { new: true }
      ).populate("customer driver");

      socket.data.driverId = driverId;
      socket.join(`ride:${rideId}`);

      // Notify customer
      io.to(`ride:${rideId}`).emit("ride:accepted", {
        rideId,
        driver: ride.driver,
      });

      // Mark driver as unavailable
      await Driver.findByIdAndUpdate(driverId, { isAvailable: false });

      console.log(`Driver ${driverId} accepted ride ${rideId}`);
    } catch (error) {
      console.error("ride:accept error:", error.message);
    }
  });

  // ── Driver is arriving ──────────────────────────────
  socket.on("ride:arriving", ({ rideId }) => {
    io.to(`ride:${rideId}`).emit("ride:arriving", { rideId });
  });

  // ── Driver started the ride ─────────────────────────
  socket.on("ride:start", async ({ rideId }) => {
    await Ride.findByIdAndUpdate(rideId, { status: "started" });
    io.to(`ride:${rideId}`).emit("ride:started", { rideId });
  });

  // ── Driver completed the ride ───────────────────────
  socket.on("ride:complete", async ({ rideId }) => {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: "completed" },
      { new: true }
    );
    await Driver.findByIdAndUpdate(ride.driver, {
      isAvailable: true,
      $inc: { totalRides: 1 },
    });
    io.to(`ride:${rideId}`).emit("ride:completed", { rideId });
  });

  // ── Customer cancels ride ───────────────────────────
  socket.on("ride:cancel", async ({ rideId, reason }) => {
    await Ride.findByIdAndUpdate(rideId, {
      status:             "cancelled",
      cancelledBy:        "customer",
      cancellationReason: reason || null,
    });
    io.to(`ride:${rideId}`).emit("ride:cancelled", { rideId, by: "customer" });
    socket.leave(`ride:${rideId}`);
  });
};
