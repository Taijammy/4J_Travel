/* ================================================================
   models/task.model.js — Task schema & model
================================================================ */

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    /* Which user owns this task */
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },

    title: {
      type:      String,
      required:  [true, 'Title is required'],
      trim:      true,
      minlength: [2,   'Title must be at least 2 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },

    description: {
      type:      String,
      trim:      true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default:   '',
    },

    priority: {
      type:    String,
      enum:    {
        values:  ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },

    status: {
      type:    String,
      enum:    {
        values:  ['Pending', 'In Progress', 'Completed'],
        message: 'Status must be Pending, In Progress, or Completed',
      },
      default: 'Pending',
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

/* ── Virtual: is the task overdue? ── */
taskSchema.virtual('isOverdue').get(function () {
  return (
    this.dueDate &&
    new Date(this.dueDate) < new Date() &&
    this.status !== 'Completed'
  );
});

/* ── Index for fast per-user queries sorted by date ── */
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1 });

/* ── Clean up __v from output ── */
taskSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Task', taskSchema);