import Driver from "../models/Driver.model.js";
import { sendSuccess } from "../utils/response.js";

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ isAvailable: true }).populate("user", "name phone");
    return sendSuccess(res, { drivers });
  } catch (error) {
    next(error);
  }
};

export const updateDriverStatus = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isAvailable },
      { new: true }
    );
    return sendSuccess(res, { driver }, `Driver is now ${isAvailable ? "available" : "unavailable"}`);
  } catch (error) {
    next(error);
  }
};
