import { Server } from "socket.io";
import { ENV } from "../config/env.js";
import { bookingHandler } from "./handlers/booking.handler.js";
import { locationHandler } from "./handlers/location.handler.js";
import { driverHandler }   from "./handlers/driver.handler.js";

// Track online drivers in memory: driverId → socketId
export const onlineDrivers = new Map();

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      [ENV.CUSTOMER_URL, ENV.DRIVER_URL],
      methods:     ["GET", "POST"],
      credentials: true,
    },
    // Reconnection settings
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    const { userId, role, driverId } = socket.handshake.query;

    console.log(`🔌 Connected  | ${socket.id} | role: ${role} | userId: ${userId}`);

    // Store identity on socket for use in handlers
    socket.data.userId   = userId;
    socket.data.role     = role;
    socket.data.driverId = driverId || null;

    // Track driver sockets
    if (role === "driver" && driverId) {
      onlineDrivers.set(driverId, socket.id);
      console.log(`🚗 Driver online: ${driverId}`);
    }

    // Register domain handlers
    bookingHandler(io, socket);
    locationHandler(io, socket);
    driverHandler(io, socket);

    // ── Disconnect ──────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`❌ Disconnected | ${socket.id} | reason: ${reason}`);

      if (role === "driver" && driverId) {
        onlineDrivers.delete(driverId);
        console.log(`🚗 Driver offline: ${driverId}`);

        // Notify any active ride room that driver disconnected
        if (socket.data.activeRideId) {
          io.to(`ride:${socket.data.activeRideId}`).emit("driver:disconnected", {
            message: "Driver lost connection. Reconnecting...",
          });
        }
      }
    });

    // ── Reconnect handling ──────────────────────────
    socket.on("reconnect", () => {
      console.log(`🔄 Reconnected | ${socket.id}`);
      if (role === "driver" && driverId) {
        onlineDrivers.set(driverId, socket.id);
        // Rejoin active ride room if any
        if (socket.data.activeRideId) {
          socket.join(`ride:${socket.data.activeRideId}`);
        }
      }
    });
  });

  return io;
};
