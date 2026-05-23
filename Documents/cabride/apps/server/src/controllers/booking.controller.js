import Booking from "../models/Booking.model.js";
import { sendSuccess, sendCreated, sendNotFound, sendBadRequest } from "../utils/response.js";

export const createBooking = async (req, res, next) => {
  try {
    const { pickup, dropoff } = req.body;
    const booking = await Booking.create({ customer: req.user.id, pickup, dropoff });
    return sendCreated(res, { booking }, "Booking created");
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate({ path: "driver", populate: { path: "user", select: "name phone" } });

    if (!booking) return sendNotFound(res, "Booking not found");
    return sendSuccess(res, { booking });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === "customer"
      ? { customer: req.user.id }
      : {};

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    return sendSuccess(res, { bookings });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const VALID = ["accepted", "in_progress", "completed", "cancelled"];
    if (!VALID.includes(status)) return sendBadRequest(res, `Invalid status. Must be one of: ${VALID.join(", ")}`);

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!booking) return sendNotFound(res, "Booking not found");
    return sendSuccess(res, { booking }, "Booking status updated");
  } catch (error) {
    next(error);
  }
};
