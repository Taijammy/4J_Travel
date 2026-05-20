/* ================================================================
   middleware/auth.middleware.js — JWT + Role-based guards
================================================================ */

const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

/* ── Helper: 401 response ── */
const unauthorized = (res, msg = 'Not authorized. Please log in.') =>
  res.status(401).json({ success: false, error: msg });

/* ── Helper: 403 response ── */
const forbidden = (res, msg = 'Access denied. Insufficient permissions.') =>
  res.status(403).json({ success: false, error: msg });

/* ================================================================
   protect — verify JWT, attach user to req
================================================================ */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback: httpOnly cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return unauthorized(res);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user)           return unauthorized(res, 'User no longer exists.');
    if (!user.isActive)  return unauthorized(res, 'Account has been deactivated.');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')  return unauthorized(res, 'Session expired. Please log in again.');
    if (err.name === 'JsonWebTokenError')  return unauthorized(res, 'Invalid token. Please log in again.');
    next(err);
  }
};

/* ================================================================
   adminOnly — must be admin role
================================================================ */
const adminOnly = (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (req.user.role !== 'admin') {
    return forbidden(res, 'Admin access required.');
  }
  next();
};

/* ================================================================
   authorizeRoles(...roles) — flexible role check
   Usage: authorizeRoles('admin', 'moderator')
================================================================ */
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return unauthorized(res);
  if (!roles.includes(req.user.role)) {
    return forbidden(res, `Access denied. Required role: ${roles.join(' or ')}`);
  }
  next();
};

module.exports = { protect, adminOnly, authorizeRoles };