/* ================================================================
   routes/auth.routes.js — Auth routes
   Base path: /api/auth
================================================================ */

const express = require('express');
const router  = express.Router();

const { register, login, logout, getMe } = require('../controllers/auth.controller');
const { protect }                         = require('../middleware/auth.middleware');
const {
  registerRules,
  loginRules,
  validate,
} = require('../middleware/validate.middleware');

/* ── Public routes ── */

// POST /api/auth/register
router.post('/register', registerRules, validate, register);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// POST /api/auth/logout
router.post('/logout', logout);

/* ── Protected routes ── */

// GET /api/auth/me  — get current logged-in user
router.get('/me', protect, getMe);

module.exports = router;