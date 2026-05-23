import dotenv from "dotenv";
dotenv.config();

const _required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

export const ENV = {
  NODE_ENV:      process.env.NODE_ENV || "development",
  PORT:          parseInt(process.env.PORT || "4000", 10),
  MONGODB_URI:   _required("MONGODB_URI"),
  JWT_SECRET:    _required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CUSTOMER_URL:  process.env.CUSTOMER_URL || "http://localhost:3000",
  DRIVER_URL:    process.env.DRIVER_URL   || "http://localhost:3001",
  IS_PROD:       process.env.NODE_ENV === "production",
};
