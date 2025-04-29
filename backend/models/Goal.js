const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  month: {
    type: Number,
    required: true,
    min: 0,
    max: 11, // 0 for January, 11 for December
  },
  year: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Goal', GoalSchema);