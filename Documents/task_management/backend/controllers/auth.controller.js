/* ================================================================
   controllers/auth.controller.js — Register, Login, Logout, Me
================================================================ */

const jwt  = require('jsonwebtoken');
const User = require('../models/user.model');

/* ── Sign JWT + set cookie ── */
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role }, // ← include role in token
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res
    .status(statusCode)
    .cookie('token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   Number(process.env.COOKIE_MAX_AGE_MS) || 604800000,
    })
    .json({
      success: true,
      message: statusCode === 201 ? 'Account created successfully' : 'Login successful',
      data: {
        token,
        user: {
          id:    user._id,
          name:  user.name,
          email: user.email,
          role:  user.role, // ← send role to frontend
        },
      },
    });
};

/* ── POST /api/auth/register ── */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error:   'An account with this email already exists',
      });
    }

    // First registered user becomes admin automatically
    const userCount = await User.countDocuments();
    const role      = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/login ── */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account has been deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/* ── POST /api/auth/logout ── */
const logout = (req, res) => {
  res
    .cookie('token', '', { httpOnly: true, expires: new Date(0) })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
};

/* ── GET /api/auth/me ── */
const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id:        req.user._id,
        name:      req.user.name,
        email:     req.user.email,
        role:      req.user.role,
        createdAt: req.user.createdAt,
      },
    },
  });
};

module.exports = { register, login, logout, getMe };