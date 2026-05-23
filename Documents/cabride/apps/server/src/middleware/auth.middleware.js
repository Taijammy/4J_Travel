import { verifyToken } from "../utils/jwt.js";
import { sendUnauthorized, sendForbidden } from "../utils/response.js";

/**
 * Protect any route — requires a valid Bearer token.
 * Attaches decoded user to req.user.
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendUnauthorized(res, "No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendUnauthorized(res, "Invalid or expired token");
  }
};

/**
 * Restrict route to specific roles.
 * Usage: restrictTo("customer") or restrictTo("driver")
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return sendForbidden(res, `Access restricted to: ${roles.join(", ")}`);
    }
    next();
  };
};
