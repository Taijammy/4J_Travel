import Driver from "../models/Driver.model.js";
import Ride, { RIDE_STATUS } from "../models/Ride.model.js";
import {
  createRide,
  getActiveRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
} from "../services/ride.service.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  sendForbidden,
} from "../utils/response.js";

/**
 * POST /api/v1/rides
 * Customer creates a ride request
 */
export const requestRide = async (req, res, next) => {
  try {
    const { pickup, dropoff } = req.body;

    // Block if customer already has an active ride
    const existing = await getActiveRide(req.user.id, "customer");
    if (existing) {
      return sendBadRequest(res, "You already have an active ride. Cancel it first.");
    }

    const ride = await createRide({
      customerId: req.user.id,
      pickup,
      dropoff,
    });

    return sendCreated(res, { ride }, "Ride requested successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rides/active
 * Get the current active ride for customer or driver
 */
export const getMyActiveRide = async (req, res, next) => {
  try {
    const ride = await getActiveRide(req.user.id, req.user.role);
    if (!ride) return sendNotFound(res, "No active ride found");
    return sendSuccess(res, { ride });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rides/:id
 * Get a specific ride by ID
 */
export const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate({ path: "driver", populate: { path: "user", select: "name phone" } });

    if (!ride) return sendNotFound(res, "Ride not found");

    // Only customer or assigned driver can view
    const isCustomer = ride.customer._id.toString() === req.user.id;
    const isDriver   = ride.driver?.user?._id.toString() === req.user.id;
    if (!isCustomer && !isDriver) {
      return sendForbidden(res, "You are not authorized to view this ride");
    }

    return sendSuccess(res, { ride });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rides/history
 * Get all past rides for the logged-in user
 */
export const getRideHistory = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user.id;
    } else {
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver) return sendNotFound(res, "Driver profile not found");
      filter.driver = driver._id;
    }

    const rides = await Ride.find(filter)
      .populate("customer", "name phone")
      .populate({ path: "driver", populate: { path: "user", select: "name phone" } })
      .sort({ createdAt: -1 })
      .limit(20);

    return sendSuccess(res, { count: rides.length, rides });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/rides/pending
 * Driver fetches all pending ride requests
 */
export const getPendingRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ status: RIDE_STATUS.REQUESTED })
      .populate("customer", "name phone")
      .sort({ createdAt: 1 }); // oldest first

    return sendSuccess(res, { count: rides.length, rides });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/rides/:id/accept
 * Driver accepts a ride request
 */
export const acceptRideRequest = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) return sendNotFound(res, "Driver profile not found");

    if (!driver.isOnline || !driver.isAvailable) {
      return sendBadRequest(res, "You must be online and available to accept rides");
    }

    const ride = await acceptRide({ rideId: req.params.id, driverId: driver._id });
    if (!ride) return sendBadRequest(res, "Ride is no longer available");

    return sendSuccess(res, { ride }, "Ride accepted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/rides/:id/status
 * Driver updates ride status: arriving → started → completed
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) return sendNotFound(res, "Driver profile not found");

    const result = await updateRideStatus({
      rideId:   req.params.id,
      driverId: driver._id,
      status,
    });

    if (result.error) {
      return result.code === 404
        ? sendNotFound(res, result.error)
        : sendBadRequest(res, result.error);
    }

    return sendSuccess(res, { ride: result.ride }, `Ride status updated to: ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/rides/:id/cancel
 * Customer or driver cancels a ride
 */
export const cancelRideRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const ride = await cancelRide({
      rideId: req.params.id,
      userId: req.user.id,
      role:   req.user.role,
      reason,
    });

    if (!ride) return sendBadRequest(res, "Ride cannot be cancelled — it may already be completed or not found");

    return sendSuccess(res, { ride }, "Ride cancelled successfully");
  } catch (error) {
    next(error);
  }
};
