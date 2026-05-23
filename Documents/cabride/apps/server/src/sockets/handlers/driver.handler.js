/**
 * Driver availability socket events.
 *
 * Driver emits:  driver:available   → marks driver as online & available
 * Driver emits:  driver:unavailable → marks driver as offline
 */
export const driverHandler = (io, socket) => {
  socket.on("driver:available", ({ driverId }) => {
    socket.data.driverId = driverId;
    socket.join("drivers:available");
    console.log(`Driver ${driverId} is now available`);
  });

  socket.on("driver:unavailable", ({ driverId }) => {
    socket.leave("drivers:available");
    console.log(`Driver ${driverId} is now unavailable`);
  });
};
