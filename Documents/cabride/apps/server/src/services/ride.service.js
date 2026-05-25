import Ride, { RIDE_STATUS } from "../models/Ride.model.js";
import Driver from "../models/Driver.model.js";

export const createRide = async ({ customerId, pickup, dropoff }) => {
  const distKm = Math.sqrt(
    Math.pow(dropoff.latitude  - pickup.latitude,  2) +
    Math.pow(dropoff.longitude - pickup.longitude, 2)
  ) * 111;

  // INR pricing: ₹50 base + ₹18/km
  const estimatedFare = Math.max(50, Math.round((50 + distKm * 18) * 100) / 100);

  const ride = await Ride.create({
    customer: customerId,
    pickup,
    dropoff,
    status: RIDE_STATUS.REQUESTED,
    fare:   { estimated: estimatedFare, currency: "INR" },
  });

  return ride;
};

export const getActiveRide = async (userId, role) => {
  const activeStatuses = [
    RIDE_STATUS.REQUESTED,
    RIDE_STATUS.ACCEPTED,
    RIDE_STATUS.ARRIVING,
    RIDE_STATUS.STARTED,
  ];

  const filter = role === "customer"
    ? { customer: userId, status: { $in: activeStatuses } }
    : {};

  if (role === "driver") {
    const driver = await Driver.findOne({ user: userId });
    if (!driver) return null;
    filter.driver = driver._id;
    filter.status = { $in: activeStatuses };
  }

  return Ride.findOne(filter)
    .populate("customer", "name phone email")
    .populate({ path: "driver", populate: { path: "user", select: "name phone" } })
    .sort({ createdAt: -1 });
};

export const acceptRide = async ({ rideId, driverId }) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, status: RIDE_STATUS.REQUESTED },
    { driver: driverId, status: RIDE_STATUS.ACCEPTED },
    { new: true }
  )
    .populate("customer", "name phone email")
    .populate({ path: "driver", populate: { path: "user", select: "name phone" } });

  if (!ride) return null;
  await Driver.findByIdAndUpdate(driverId, { isAvailable: false });
  return ride;
};

export const updateRideStatus = async ({ rideId, driverId, status }) => {
  const VALID_TRANSITIONS = {
    [RIDE_STATUS.ACCEPTED]:  RIDE_STATUS.ARRIVING,
    [RIDE_STATUS.ARRIVING]:  RIDE_STATUS.STARTED,
    [RIDE_STATUS.STARTED]:   RIDE_STATUS.COMPLETED,
  };

  const ride = await Ride.findOne({ _id: rideId, driver: driverId });
  if (!ride) return { error: "Ride not found", code: 404 };

  const expected = VALID_TRANSITIONS[ride.status];
  if (expected !== status) {
    return {
      error: `Invalid transition. Current: ${ride.status} → allowed next: ${expected}`,
      code: 400,
    };
  }

  ride.status = status;
  await ride.save();

  if (status === RIDE_STATUS.COMPLETED) {
    await Driver.findByIdAndUpdate(driverId, {
      isAvailable: true,
      $inc: { totalRides: 1 },
    });
  }

  return { ride };
};

export const cancelRide = async ({ rideId, userId, role, reason }) => {
  const cancellableStatuses = [RIDE_STATUS.REQUESTED, RIDE_STATUS.ACCEPTED, RIDE_STATUS.ARRIVING];
  let filter = { _id: rideId, status: { $in: cancellableStatuses } };
  if (role === "customer") filter.customer = userId;

  const ride = await Ride.findOneAndUpdate(
    filter,
    { status: RIDE_STATUS.CANCELLED, cancelledBy: role, cancellationReason: reason || null },
    { new: true }
  );

  if (!ride) return null;
  if (ride.driver) {
    await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true });
  }
  return ride;
};
