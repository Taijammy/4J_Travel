import mongoose from "mongoose";

/**
 * DriverLocation — stores real-time location snapshots from drivers.
 *
 * Why a separate collection?
 * - Driver location updates fire every 3-5 seconds via Socket.IO
 * - Keeping them separate avoids hammering the Driver document
 * - Enables location history / route replay if needed later
 * - TTL index auto-deletes old records after 1 hour (keeps collection lean)
 */
const driverLocationSchema = new mongoose.Schema(
  {
    // ── Relationships ─────────────────────────────────
    driver: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Driver",
      required: [true, "Driver reference is required"],
    },
    ride: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Ride",
      default: null, // null when driver is idle, set when on a ride
    },

    // ── Coordinates ───────────────────────────────────
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

    // ── Movement data ─────────────────────────────────
    speed: {
      type:    Number, // km/h
      default: null,
      min:     0,
    },
    heading: {
      type:    Number, // degrees 0-360
      default: null,
      min:     0,
      max:     360,
    },
    accuracy: {
      type:    Number, // meters
      default: null,
    },

    // ── TTL: auto-delete after 1 hour ─────────────────
    recordedAt: {
      type:    Date,
      default: Date.now,
      index:   { expireAfterSeconds: 3600 },
    },
  },
  {
    timestamps: false, // using recordedAt instead
  }
);

// ── Indexes ───────────────────────────────────────────
driverLocationSchema.index({ driver: 1, recordedAt: -1 }); // latest location per driver
driverLocationSchema.index({ ride: 1,   recordedAt: -1 }); // full route for a ride

// ── Static: get latest location for a driver ──────────
driverLocationSchema.statics.getLatest = async function (driverId) {
  return this.findOne({ driver: driverId }).sort({ recordedAt: -1 }).lean();
};

// ── Static: get full route for a ride ────────────────
driverLocationSchema.statics.getRideRoute = async function (rideId) {
  return this.find({ ride: rideId }).sort({ recordedAt: 1 }).lean();
};

const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema);
export default DriverLocation;
