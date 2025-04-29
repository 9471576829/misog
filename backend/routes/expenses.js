const express = require('express');
const router = express.Router();
const Expense = require('../routes/expenses');
const authMiddleware = require('../middleware/authMiddleware');

// Route to add a new expense (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { amount, category, note, date } = req.body;

    const newExpense = new Expense({
      userId: req.userId, // User ID from the auth middleware
      amount,
      category,
      note,
      date,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense); // Respond with the created expense
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Failed to add expense' });
  }
});

// Route to get all expenses for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const expenses = await Expense.find({ userId }).sort({ createdAt: -1 }); // Sort by newest first
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Route to get expenses with filtering and sorting
router.get('/filtered', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { category, dateRange, sortBy, startDate, endDate } = req.query;
    const filter = { userId };
    const sort = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (dateRange) {
      const now = new Date();
      let queryDate;

      if (dateRange === 'last7days') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        queryDate = { $gte: sevenDaysAgo, $lte: now };
      } else if (dateRange === 'thismonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        queryDate = { $gte: startOfMonth, $lte: endOfMonth };
      } else if (dateRange === 'custom' && startDate && endDate) {
        queryDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }

      if (queryDate) {
        filter.date = queryDate;
      }
    }

    if (sortBy === 'newest') {
      sort.createdAt = -1;
    } else if (sortBy === 'highest') {
      sort.amount = -1;
    }

    const expenses = await Expense.find(filter).sort(sort);
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching and filtering expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Route to update an existing expense (requires authentication)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const { amount, category, note, date } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the user owns this expense
    if (expense.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this expense' });
    }

    expense.amount = amount;
    expense.category = category;
    expense.note = note;
    expense.date = date;

    const updatedExpense = await expense.save();
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Route to delete an expense (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expenseId = req.params.id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Ensure the user owns this expense
    if (expense.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this expense' });
    }

    await Expense.findByIdAndDelete(expenseId);
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

module.exports = router;