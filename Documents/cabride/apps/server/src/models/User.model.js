import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, "Name is required"],
      trim:      true,
      minlength: [2,  "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,   // this already creates an index — no schema.index() needed
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type:      String,
      required:  [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select:    false,
    },
    phone: {
      type:  String,
      trim:  true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Please provide a valid phone number"],
    },
    role: {
      type:     String,
      enum:     {
        values:  ["customer", "driver"],
        message: "Role must be customer or driver",
      },
      required: [true, "Role is required"],
      index:    true, // only role index here — email is covered by unique:true
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Hash password before saving ───────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance methods ──────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;



