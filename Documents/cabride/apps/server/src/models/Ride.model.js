import mongoose from "mongoose";

// ── Ride status enum ──────────────────────────────────
export const RIDE_STATUS = {
  REQUESTED:  "requested",
  ACCEPTED:   "accepted",
  ARRIVING:   "arriving",
  STARTED:    "started",
  COMPLETED:  "completed",
  CANCELLED:  "cancelled",
};

// ── Location point sub-schema ─────────────────────────
const locationPointSchema = new mongoose.Schema(
  {
    address: {
      type:     String,
      required: [true, "Address is required"],
      trim:     true,
    },
    latitude: {
      type:     Number,
      required: [true, "Latitude is required"],
      min:      [-90,  "Latitude must be between -90 and 90"],
      max:      [90,   "Latitude must be between -90 and 90"],
    },
    longitude: {
      type:     Number,
      required: [true, "Longitude is required"],
      min:      [-180, "Longitude must be between -180 and 180"],
      max:      [180,  "Longitude must be between -180 and 180"],
    },
  },
  { _id: false }
);

const rideSchema = new mongoose.Schema(
  {
    // ── Relationships ─────────────────────────────────
    customer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Ride must belong to a customer"],
    },
    driver: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Driver",
      default: null,
    },

    // ── Locations ─────────────────────────────────────
    pickup: {
      type:     locationPointSchema,
      required: [true, "Pickup location is required"],
    },
    dropoff: {
      type:     locationPointSchema,
      required: [true, "Dropoff location is required"],
    },

    // ── Status ────────────────────────────────────────
    status: {
      type:    String,
      enum:    {
        values:  Object.values(RIDE_STATUS),
        message: `Status must be one of: ${Object.values(RIDE_STATUS).join(", ")}`,
      },
      default: RIDE_STATUS.REQUESTED,
    },

    // ── Timestamps per status change ──────────────────
    acceptedAt:  { type: Date, default: null },
    arrivingAt:  { type: Date, default: null },
    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // ── Fare ──────────────────────────────────────────
    fare: {
      estimated: { type: Number, default: null },
      final:     { type: Number, default: null },
      currency:  { type: String, default: "USD" },
    },

    // ── Cancellation ──────────────────────────────────
    cancelledBy:     { type: String, enum: ["customer", "driver", null], default: null },
    cancellationReason: { type: String, default: null },

    // ── Rating ────────────────────────────────────────
    customerRating: {
      type: Number,
      min:  1,
      max:  5,
      default: null,
    },
    customerReview: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────
rideSchema.index({ customer: 1, createdAt: -1 });
rideSchema.index({ driver: 1,   createdAt: -1 });
rideSchema.index({ status: 1 });

// ── Virtual: ride duration in minutes ─────────────────
rideSchema.virtual("durationMinutes").get(function () {
  if (!this.startedAt || !this.completedAt) return null;
  return Math.round((this.completedAt - this.startedAt) / 60000);
});

// ── Auto-set status timestamps ────────────────────────
rideSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const now = new Date();
    if (this.status === RIDE_STATUS.ACCEPTED  && !this.acceptedAt)  this.acceptedAt  = now;
    if (this.status === RIDE_STATUS.ARRIVING  && !this.arrivingAt)  this.arrivingAt  = now;
    if (this.status === RIDE_STATUS.STARTED   && !this.startedAt)   this.startedAt   = now;
    if (this.status === RIDE_STATUS.COMPLETED && !this.completedAt) this.completedAt = now;
    if (this.status === RIDE_STATUS.CANCELLED && !this.cancelledAt) this.cancelledAt = now;
  }
  next();
});

const Ride = mongoose.model("Ride", rideSchema);
export default Ride;
