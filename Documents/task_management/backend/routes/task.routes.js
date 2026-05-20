/* ================================================================
   routes/task.routes.js — Task CRUD routes
   Base path: /api/tasks
   All routes are protected (require valid JWT)
================================================================ */

const express = require('express');
const router  = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

const { protect } = require('../middleware/auth.middleware');
const {
  createTaskRules,
  updateTaskRules,
  taskIdRule,
  validate,
} = require('../middleware/validate.middleware');

// Apply protect to every route in this file
router.use(protect);

/* ── Routes ── */

// GET    /api/tasks          — fetch all tasks (with optional filters)
// POST   /api/tasks          — create a new task
router
  .route('/')
  .get(getTasks)
  .post(createTaskRules, validate, createTask);

// GET    /api/tasks/:id      — fetch single task
// PUT    /api/tasks/:id      — update task
// DELETE /api/tasks/:id      — delete task
router
  .route('/:id')
  .get(taskIdRule, validate, getTaskById)
  .put(updateTaskRules, validate, updateTask)
  .delete(taskIdRule, validate, deleteTask);

module.exports = router;