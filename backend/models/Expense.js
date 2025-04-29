// budgetbloom/models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01, // Ensure amount is at least a penny/cent
  },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'],
    required: true,
  },
  note: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Expense = mongoose.model('Expense', ExpenseSchema);

module.exports = Expense;