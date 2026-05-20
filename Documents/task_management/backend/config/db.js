/* ================================================================
   config/db.js — MongoDB connection via Mongoose
================================================================ */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options suppress deprecation warnings
      autoIndex: true,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process on DB failure
  }
};

// Log when disconnected
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️   MongoDB disconnected');
});

module.exports = connectDB;