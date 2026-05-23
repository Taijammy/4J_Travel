import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
    fare:        { type: Number, default: null },
  },
  { timestamps: true }
);

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
