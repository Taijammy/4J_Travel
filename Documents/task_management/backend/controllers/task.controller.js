/* ================================================================
   controllers/task.controller.js — Task CRUD with role awareness
   Admin → sees ALL tasks
   User  → sees only their own tasks
================================================================ */

const Task = require('../models/task.model');

/* ── Build filter based on role ── */
const buildFilter = (req, extra = {}) => {
  const filter = { ...extra };
  // Admin sees all tasks, user sees only their own
  if (req.user.role !== 'admin') {
    filter.user = req.user._id;
  }
  return filter;
};

/* ================================================================
   GET /api/tasks
================================================================ */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sort, userId } = req.query;

    const filter = buildFilter(req);

    // Admin can filter by specific user
    if (req.user.role === 'admin' && userId) {
      filter.user = userId;
    }

    if (status   && status   !== 'All') filter.status   = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortMap = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt:  1 },
      dueDate:  { dueDate:    1 },
      priority: { priority:  -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    // Populate user info for admin view
    const tasksQuery = Task.find(filter).sort(sortBy);
    if (req.user.role === 'admin') {
      tasksQuery.populate('user', 'name email');
    }
    const tasks = await tasksQuery;

    // Stats — scoped by role
    const statsFilter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const allTasks    = await Task.find(statsFilter);
    const stats = {
      total:      allTasks.length,
      completed:  allTasks.filter(t => t.status === 'Completed').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      pending:    allTasks.filter(t => t.status === 'Pending').length,
    };

    res.status(200).json({
      success: true,
      count:   tasks.length,
      role:    req.user.role,
      stats,
      data:    { tasks },
    });
  } catch (err) {
    next(err);
  }
};

/* ================================================================
   GET /api/tasks/:id
================================================================ */
const getTaskById = async (req, res, next) => {
  try {
    const filter = buildFilter(req, { _id: req.params.id });
    const task   = await Task.findOne(filter);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({ success: true, data: { task } });
  } catch (err) {
    next(err);
  }
};

/* ================================================================
   POST /api/tasks
================================================================ */
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    // Admin can create task for any user, default to themselves
    const taskOwner = req.body.assignTo && req.user.role === 'admin'
      ? req.body.assignTo
      : req.user._id;

    const task = await Task.create({
      user: taskOwner,
      title,
      description,
      priority,
      status,
      dueDate: dueDate || undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data:    { task },
    });
  } catch (err) {
    next(err);
  }
};

/* ================================================================
   PUT /api/tasks/:id
================================================================ */
const updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const updates = {};
    if (title       !== undefined) updates.title       = title;
    if (description !== undefined) updates.description = description;
    if (priority    !== undefined) updates.priority    = priority;
    if (status      !== undefined) updates.status      = status;
    if (dueDate     !== undefined) updates.dueDate     = dueDate || null;

    // Admin can update any task, user only their own
    const filter = buildFilter(req, { _id: req.params.id });
    const task   = await Task.findOneAndUpdate(filter, updates, {
      new:            true,
      runValidators:  true,
    });

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data:    { task },
    });
  } catch (err) {
    next(err);
  }
};

/* ================================================================
   DELETE /api/tasks/:id
================================================================ */
const deleteTask = async (req, res, next) => {
  try {
    // Admin can delete any task, user only their own
    const filter = buildFilter(req, { _id: req.params.id });
    const task   = await Task.findOneAndDelete(filter);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data:    { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };