import Driver from "../models/Driver.model.js";
import User from "../models/User.model.js";
import { sendSuccess, sendNotFound, sendBadRequest } from "../utils/response.js";

/**
 * GET /api/v1/drivers/available
 * Public-ish — any logged in user can see available drivers
 */
export const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ isAvailable: true, isOnline: true })
      .populate("user", "name phone")
      .select("-__v");

    return sendSuccess(res, { count: drivers.length, drivers });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/drivers/profile
 * Driver gets their own profile
 */
export const getDriverProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate("user", "name email phone role createdAt")
      .select("-__v");

    if (!driver) return sendNotFound(res, "Driver profile not found");

    return sendSuccess(res, { driver });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/online
 * Driver goes online — makes them visible to customers
 */
export const goOnline = async (req, res, next) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isOnline: true, isAvailable: true },
      { new: true }
    ).populate("user", "name phone");

    if (!driver) return sendNotFound(res, "Driver profile not found");

    return sendSuccess(res, { driver }, "You are now online and available");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/offline
 * Driver goes offline — hidden from customers
 */
export const goOffline = async (req, res, next) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isOnline: false, isAvailable: false },
      { new: true }
    ).populate("user", "name phone");

    if (!driver) return sendNotFound(res, "Driver profile not found");

    return sendSuccess(res, { driver }, "You are now offline");
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/availability
 * Toggle availability while staying online
 * e.g. driver is online but temporarily not accepting rides
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return sendBadRequest(res, "isAvailable must be true or false");
    }

    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver) return sendNotFound(res, "Driver profile not found");

    // Can't be available if offline
    if (isAvailable && !driver.isOnline) {
      return sendBadRequest(res, "You must be online to set yourself as available. Use /online first.");
    }

    driver.isAvailable = isAvailable;
    await driver.save();

    return sendSuccess(
      res,
      { driver },
      `You are now ${isAvailable ? "available for rides" : "not accepting rides"}`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/drivers/vehicle
 * Driver updates vehicle info
 */
export const updateVehicleInfo = async (req, res, next) => {
  try {
    const { vehicleNumber, vehicleModel, vehicleColor } = req.body;

    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { vehicleNumber, vehicleModel, vehicleColor },
      { new: true, runValidators: true }
    ).populate("user", "name phone email");

    if (!driver) return sendNotFound(res, "Driver profile not found");

    return sendSuccess(res, { driver }, "Vehicle info updated");
  } catch (error) {
    next(error);
  }
};
