import Driver from "../models/Driver.model.js";
import Ride, { RIDE_STATUS } from "../models/Ride.model.js";
import { createRide, getActiveRide, acceptRide, updateRideStatus, cancelRide } from "../services/ride.service.js";
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from "../utils/response.js";

export const requestRide = async (req, res, next) => {
  try {
    const { pickup, dropoff } = req.body;

    console.log("🔍 user:", req.user.id, "role:", req.user.role);
    console.log("🔍 body:", JSON.stringify(req.body));

    const existing = await Ride.findOne({
      customer: req.user.id,
      status: { $in: ["requested", "accepted", "arriving", "started"] },
    });

    console.log("🔍 existing:", existing ? existing._id : "NONE");

    if (existing) {
      return res.status(409).json({ success: false, message: "You already have an active ride.", data: { rideId: existing._id } });
    }

    console.log("🔍 creating ride now...");
    const ride = await createRide({ customerId: req.user.id, pickup, dropoff });
    console.log("✅ ride created:", ride._id);
    return sendCreated(res, { ride }, "Ride requested successfully");
  } catch (error) {
    console.log("❌ ERROR in requestRide:", error.message, "code:", error.code);
    next(error);
  }
};

export const getMyActiveRide = async (req, res, next) => {
  try {
    const ride = await getActiveRide(req.user.id, req.user.role);
    if (!ride) return sendNotFound(res, "No active ride found");
    return sendSuccess(res, { ride });
  } catch (error) { next(error); }
};

export const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate({ path: "driver", populate: { path: "user", select: "name phone" } });
    if (!ride) return sendNotFound(res, "Ride not found");
    return sendSuccess(res, { ride });
  } catch (error) { next(error); }
};

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
      .sort({ createdAt: -1 }).limit(20);
    return sendSuccess(res, { count: rides.length, rides });
  } catch (error) { next(error); }
};

export const getPendingRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ status: RIDE_STATUS.REQUESTED })
      .populate("customer", "name phone").sort({ createdAt: 1 });
    return sendSuccess(res, { count: rides.length, rides });
  } catch (error) { next(error); }
};

export const acceptRideRequest = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) return sendNotFound(res, "Driver profile not found");
    const ride = await acceptRide({ rideId: req.params.id, driverId: driver._id });
    if (!ride) return sendBadRequest(res, "Ride is no longer available");
    return sendSuccess(res, { ride }, "Ride accepted");
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) return sendNotFound(res, "Driver profile not found");
    const result = await updateRideStatus({ rideId: req.params.id, driverId: driver._id, status });
    if (result.error) return result.code === 404 ? sendNotFound(res, result.error) : sendBadRequest(res, result.error);
    return sendSuccess(res, { ride: result.ride }, `Status updated to: ${status}`);
  } catch (error) { next(error); }
};

export const cancelRideRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ride = await cancelRide({ rideId: req.params.id, userId: req.user.id, role: req.user.role, reason });
    if (!ride) return sendBadRequest(res, "Ride cannot be cancelled");
    return sendSuccess(res, { ride }, "Ride cancelled");
  } catch (error) { next(error); }
};
