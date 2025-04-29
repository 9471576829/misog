const express = require('express');
const router = express.Router();
const Expense = require('../routes/expenses');
const authMiddleware = require('../middleware/authMiddleware');

// Route to get total spending per category for the current month
router.get('/category-spending', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching category spending:', error);
    res.status(500).json({ message: 'Failed to fetch category spending data' });
  }
});

// Route to get spending over time (e.g., last 30 days)
router.get('/spending-over-time', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: thirtyDaysAgo, $lte: now },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date
      },
    ]);

    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching spending over time:', error);
    res.status(500).json({ message: 'Failed to fetch spending over time data' });
  }
});

module.exports = router;