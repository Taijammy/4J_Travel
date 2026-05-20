/* ================================================================
   middleware/validate.middleware.js — express-validator helpers
   Usage: add validate() as the last middleware in a route array
================================================================ */

const { body, param, validationResult } = require('express-validator');

/* ── Run validationResult and return 422 if errors exist ── */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error:   'Validation failed',
      details: errors.array().map(e => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

/* ================================================================
   Reusable validation rule sets
================================================================ */

/* ── Auth ── */
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

/* ── Tasks ── */
const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),

  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
];

const updateTaskRules = [
  param('id')
    .isMongoId().withMessage('Invalid task ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('Title must be 2-120 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),

  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
];

const taskIdRule = [
  param('id')
    .isMongoId().withMessage('Invalid task ID'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  createTaskRules,
  updateTaskRules,
  taskIdRule,
};