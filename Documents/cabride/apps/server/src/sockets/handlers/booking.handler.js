import Ride, { RIDE_STATUS } from "../../models/Ride.model.js";
import Driver from "../../models/Driver.model.js";

/**
 * BOOKING / RIDE LIFECYCLE HANDLER
 *
 * Full event flow:
 *
 * CUSTOMER emits:
 *   ride:request      → broadcast to all drivers
 *   ride:subscribe    → join ride room to receive location
 *   ride:cancel       → cancel active ride
 *
 * DRIVER emits:
 *   ride:accept       → accept a ride request
 *   ride:arriving     → driver is near pickup
 *   ride:start        → ride has begun
 *   ride:complete     → ride is finished
 */
export const bookingHandler = (io, socket) => {

  /**
   * ride:request
   * Customer broadcasts a new ride request to all drivers
   * payload: { rideId, pickup, dropoff, fare }
   */
  socket.on("ride:request", (payload) => {
    console.log(`📍 ride:request from ${socket.data.userId}`, payload);
    // Broadcast to all connected drivers
    socket.broadcast.emit("ride:incoming", {
      ...payload,
      timestamp: Date.now(),
    });
  });

  /**
   * ride:subscribe
   * Customer joins the ride room after driver accepts
   * payload: { rideId }
   */
  socket.on("ride:subscribe", ({ rideId }) => {
    socket.join(`ride:${rideId}`);
    console.log(`👤 Customer subscribed to ride:${rideId}`);
    socket.emit("ride:subscribed", { rideId });
  });

  /**
   * ride:accept
   * Driver accepts a ride — joins the room, notifies customer
   * payload: { rideId }
   */
  socket.on("ride:accept", async ({ rideId }) => {
    try {
      const driver = await Driver.findById(socket.data.driverId)
        .populate("user", "name phone");

      if (!driver) {
        return socket.emit("error", { message: "Driver profile not found" });
      }

      // Join ride room
      socket.join(`ride:${rideId}`);
      socket.data.activeRideId = rideId;

      // Notify customer in the room
      io.to(`ride:${rideId}`).emit("ride:accepted", {
        rideId,
        driver: {
          id:           driver._id,
          name:         driver.user.name,
          phone:        driver.user.phone,
          vehicleModel: driver.vehicleModel,
          vehicleColor: driver.vehicleColor,
          vehicleNumber:driver.vehicleNumber,
          rating:       driver.rating,
        },
        timestamp: Date.now(),
      });

      console.log(`✅ Driver ${driver._id} accepted ride:${rideId}`);
    } catch (error) {
      console.error("ride:accept error:", error.message);
      socket.emit("error", { message: "Failed to accept ride" });
    }
  });

  /**
   * ride:arriving
   * Driver is near the pickup point
   * payload: { rideId }
   */
  socket.on("ride:arriving", async ({ rideId }) => {
    try {
      await Ride.findByIdAndUpdate(rideId, { status: RIDE_STATUS.ARRIVING });
      io.to(`ride:${rideId}`).emit("ride:arriving", {
        rideId,
        message:   "Your driver is arriving!",
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("ride:arriving error:", error.message);
    }
  });

  /**
   * ride:start
   * Driver started the ride (customer is in the car)
   * payload: { rideId }
   */
  socket.on("ride:start", async ({ rideId }) => {
    try {
      await Ride.findByIdAndUpdate(rideId, { status: RIDE_STATUS.STARTED });
      io.to(`ride:${rideId}`).emit("ride:started", {
        rideId,
        message:   "Your ride has started!",
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("ride:start error:", error.message);
    }
  });

  /**
   * ride:complete
   * Driver completed the ride
   * payload: { rideId }
   */
  socket.on("ride:complete", async ({ rideId }) => {
    try {
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        { status: RIDE_STATUS.COMPLETED },
        { new: true }
      );

      if (ride?.driver) {
        await Driver.findByIdAndUpdate(ride.driver, {
          isAvailable: true,
          $inc: { totalRides: 1 },
        });
      }

      io.to(`ride:${rideId}`).emit("ride:completed", {
        rideId,
        fare:      ride?.fare?.final || ride?.fare?.estimated,
        message:   "Ride completed! Thank you.",
        timestamp: Date.now(),
      });

      // Clean up
      socket.data.activeRideId = null;
      socket.leave(`ride:${rideId}`);

    } catch (error) {
      console.error("ride:complete error:", error.message);
    }
  });

  /**
   * ride:cancel
   * Customer or driver cancels
   * payload: { rideId, reason? }
   */
  socket.on("ride:cancel", async ({ rideId, reason }) => {
    try {
      const ride = await Ride.findByIdAndUpdate(
        rideId,
        {
          status:             RIDE_STATUS.CANCELLED,
          cancelledBy:        socket.data.role,
          cancellationReason: reason || null,
        },
        { new: true }
      );

      if (ride?.driver) {
        await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
      }

      io.to(`ride:${rideId}`).emit("ride:cancelled", {
        rideId,
        by:        socket.data.role,
        reason:    reason || null,
        timestamp: Date.now(),
      });

      socket.data.activeRideId = null;
      socket.leave(`ride:${rideId}`);

    } catch (error) {
      console.error("ride:cancel error:", error.message);
    }
  });
};
