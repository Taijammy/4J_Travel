import { Server } from "socket.io";
import { ENV } from "../config/env.js";
import { bookingHandler } from "./handlers/booking.handler.js";
import { locationHandler } from "./handlers/location.handler.js";
import { driverHandler } from "./handlers/driver.handler.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [ENV.CUSTOMER_URL, ENV.DRIVER_URL],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.handshake.query;
    console.log(`🔌 Socket connected: ${socket.id} | role: ${role} | userId: ${userId}`);

    // Register all domain handlers
    bookingHandler(io, socket);
    locationHandler(io, socket);
    driverHandler(io, socket);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
