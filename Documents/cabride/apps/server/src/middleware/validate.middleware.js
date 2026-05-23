import { sendBadRequest } from "../utils/response.js";

/**
 * Lightweight request body validator.
 * Pass an array of required field names.
 *
 * Usage: validate(["email", "password"])
 */
export const validate = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === ""
    );

    if (missing.length > 0) {
      return sendBadRequest(
        res,
        `Missing required fields: ${missing.join(", ")}`,
        missing.map((f) => ({ field: f, message: `${f} is required` }))
      );
    }

    next();
  };
};
