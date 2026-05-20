/* ================================================================
   routes/admin.routes.js — Admin only routes
   Base path: /api/admin
   All routes: protect + adminOnly
================================================================ */

const express = require('express');
const router  = express.Router();

const {
  getAllUsers,
  getStats,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require('../controllers/admin.controller');

const { protect, adminOnly } = require('../middleware/auth.middleware');

// Apply both middlewares to ALL admin routes
router.use(protect, adminOnly);

// GET  /api/admin/stats          — platform-wide stats
router.get('/stats', getStats);

// GET  /api/admin/users          — all users with task counts
router.get('/users', getAllUsers);

// PUT  /api/admin/users/:id/role — change user role
router.put('/users/:id/role', updateUserRole);

// PUT  /api/admin/users/:id/status — activate/deactivate
router.put('/users/:id/status', updateUserStatus);

// DELETE /api/admin/users/:id   — delete user + tasks
router.delete('/users/:id', deleteUser);

module.exports = router;