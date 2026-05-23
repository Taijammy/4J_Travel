import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: false,
    },
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    vehicleNumber: {
      type: String,
      trim: true,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
