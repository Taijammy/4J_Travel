/* ================================================================
   controllers/admin.controller.js — Admin only operations
================================================================ */

const User = require('../models/user.model');
const Task = require('../models/task.model');

/* ── GET /api/admin/users — get all users ── */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Add task count per user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const taskCount = await Task.countDocuments({ user: user._id });
        return { ...user.toJSON(), taskCount };
      })
    );

    res.status(200).json({
      success: true,
      count:   users.length,
      data:    { users: usersWithStats },
    });
  } catch (err) {
    next(err);
  }
};

/* ── GET /api/admin/stats — platform-wide stats ── */
const getStats = async (req, res, next) => {
  try {
    const totalUsers     = await User.countDocuments();
    const totalTasks     = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'Completed' });
    const pendingTasks   = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks= await Task.countDocuments({ status: 'In Progress' });
    const adminCount     = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          users:      { total: totalUsers, admins: adminCount, regular: totalUsers - adminCount },
          tasks:      { total: totalTasks, completed: completedTasks, pending: pendingTasks, inProgress: inProgressTasks },
          completion: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/admin/users/:id/role — change user role ── */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be user or admin' });
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data:    { user },
    });
  } catch (err) {
    next(err);
  }
};

/* ── PUT /api/admin/users/:id/status — activate/deactivate user ── */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot deactivate yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data:    { user },
    });
  } catch (err) {
    next(err);
  }
};

/* ── DELETE /api/admin/users/:id — delete user + their tasks ── */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'You cannot delete yourself' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Delete all tasks belonging to this user
    await Task.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User and all their tasks deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getStats, updateUserRole, updateUserStatus, deleteUser };