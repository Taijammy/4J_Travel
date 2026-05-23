import Ride from "../models/Ride.model.js";
import Booking from "../models/Booking.model.js";
import Driver from "../models/Driver.model.js";
import { sendSuccess, sendNotFound } from "../utils/response.js";

export const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("booking")
      .populate({ path: "driver", populate: { path: "user", select: "name phone" } })
      .populate("customer", "name phone");

    if (!ride) return sendNotFound(res, "Ride not found");
    return sendSuccess(res, { ride });
  } catch (error) {
    next(error);
  }
};

export const completeRide = async (req, res, next) => {
  try {
    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { completedAt: new Date() },
      { new: true }
    );
    if (!ride) return sendNotFound(res, "Ride not found");

    await Booking.findByIdAndUpdate(ride.booking, { status: "completed" });
    await Driver.findByIdAndUpdate(ride.driver, { isAvailable: true, $inc: { totalRides: 1 } });

    return sendSuccess(res, { ride }, "Ride completed");
  } catch (error) {
    next(error);
  }
};
