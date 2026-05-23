/**
 * Location socket events.
 *
 * Driver emits:   location:update  → server broadcasts to booking room
 * Customer gets:  location:update  → updates driver marker on map
 */
export const locationHandler = (io, socket) => {
  socket.on("location:update", ({ bookingId, lat, lng }) => {
    // Broadcast driver's position to everyone in the booking room
    io.to(`booking:${bookingId}`).emit("location:update", { lat, lng, timestamp: Date.now() });
  });
};
