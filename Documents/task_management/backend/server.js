/* ================================================================
   server.js — TaskFlow API entry point
================================================================ */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const morgan       = require('morgan');
const connectDB    = require('./config/db');

connectDB();

const app = express();

/* ── Global Middleware ── */
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

/* ── Routes ── */
const authRoutes  = require('./routes/auth.routes');
const taskRoutes  = require('./routes/task.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth',  authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes); // ← new admin routes

/* ── Health check ── */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

/* ── 404 ── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ── Global Error Handler ── */
app.use((err, req, res, next) => {
  console.error('❌  Error:', err.message);

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error:   `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error:   'Validation failed',
      details: Object.values(err.errors).map(e => ({ field: e.path, message: e.message })),
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`🔗  Health check: http://localhost:${PORT}/api/health`);
});