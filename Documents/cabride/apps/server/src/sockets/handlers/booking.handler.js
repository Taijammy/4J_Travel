/**
 * Booking socket events.
 *
 * Customer emits:  booking:request   → server broadcasts to available drivers
 * Customer emits:  booking:cancel    → server notifies driver + cleans up room
 * Customer emits:  track:subscribe   → customer joins booking room to receive location
 *
 * Driver emits:    booking:accept    → server notifies customer, creates ride room
 * Driver emits:    booking:reject    → server notifies customer
 */
export const bookingHandler = (io, socket) => {
  // Customer requests a ride
  socket.on("booking:request", (data) => {
    console.log("booking:request", data);
    // Broadcast to all connected drivers
    socket.broadcast.emit("booking:incoming", data);
  });

  // Driver accepts a booking
  socket.on("booking:accept", (data) => {
    const { bookingId, driverId } = data;
    // Create a shared room for this booking (driver + customer join)
    socket.join(`booking:${bookingId}`);
    // Notify customer
    io.to(`booking:${bookingId}`).emit("booking:accepted", { bookingId, driverId });
    console.log(`Driver ${driverId} accepted booking ${bookingId}`);
  });

  // Customer subscribes to a booking room (to receive location updates)
  socket.on("track:subscribe", ({ bookingId }) => {
    socket.join(`booking:${bookingId}`);
    console.log(`Socket ${socket.id} subscribed to booking:${bookingId}`);
  });

  // Customer cancels booking
  socket.on("booking:cancel", ({ bookingId }) => {
    io.to(`booking:${bookingId}`).emit("booking:cancelled", { bookingId });
    socket.leave(`booking:${bookingId}`);
  });
};
