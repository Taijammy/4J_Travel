import mongoose from "mongoose";
import { ENV } from "./env.js";

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
};

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, MONGO_OPTIONS);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful disconnect on app shutdown
export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("MongoDB disconnected.");
};
