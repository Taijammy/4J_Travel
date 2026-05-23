import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },
    pickup:  { type: locationSchema, required: true },
    dropoff: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    fare: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
