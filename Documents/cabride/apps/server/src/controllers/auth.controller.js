import User from "../models/User.model.js";
import Driver from "../models/Driver.model.js";
import { signToken } from "../utils/jwt.js";
import { sendSuccess, sendCreated, sendBadRequest, sendUnauthorized } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return sendBadRequest(res, "Email already registered");

    const user = await User.create({ name, email, password, role, phone });

    // If registering as a driver, create a Driver profile automatically
    if (role === "driver") {
      await Driver.create({ user: user._id });
    }

    const token = signToken({ id: user._id, role: user.role });

    return sendCreated(res, { token, user: { id: user._id, name, email, role } }, "Registration successful");
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return sendUnauthorized(res, "Invalid email or password");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendUnauthorized(res, "Invalid email or password");

    const token = signToken({ id: user._id, role: user.role });

    return sendSuccess(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, "Login successful");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return sendUnauthorized(res, "User not found");
    return sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};
