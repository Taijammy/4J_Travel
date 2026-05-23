import mongoose from "mongoose";

const coordinateSchema = new mongoose.Schema(
  {
    latitude: {
      type:    Number,
      default: null,
      min:     [-90,  "Latitude must be between -90 and 90"],
      max:     [90,   "Latitude must be between -90 and 90"],
    },
    longitude: {
      type:    Number,
      default: null,
      min:     [-180, "Longitude must be between -180 and 180"],
      max:     [180,  "Longitude must be between -180 and 180"],
    },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Driver must be linked to a user"],
      unique:   true, // unique:true already creates the index — no schema.index() needed
    },

    isAvailable: {
      type:    Boolean,
      default: false,
    },
    isOnline: {
      type:    Boolean,
      default: false,
    },

    currentLocation: {
      type:    coordinateSchema,
      default: () => ({ latitude: null, longitude: null }),
    },
    lastLocationUpdate: {
      type:    Date,
      default: null,
    },

    vehicleNumber: {
      type:      String,
      trim:      true,
      uppercase: true,
    },
    vehicleModel: {
      type: String,
      trim: true,
    },
    vehicleColor: {
      type: String,
      trim: true,
    },

    totalRides: {
      type:    Number,
      default: 0,
      min:     0,
    },
    rating: {
      type:    Number,
      default: 5.0,
      min:     [1, "Rating cannot be less than 1"],
      max:     [5, "Rating cannot exceed 5"],
    },
    totalRatings: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Only compound index needed — user index is already covered by unique:true above
driverSchema.index({ isAvailable: 1, isOnline: 1 });

driverSchema.virtual("locationCoords").get(function () {
  const { latitude, longitude } = this.currentLocation || {};
  if (latitude == null || longitude == null) return null;
  return { latitude, longitude };
});

const Driver = mongoose.model("Driver", driverSchema);
export default Driver;
