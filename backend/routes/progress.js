const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/current-month', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Fetch the user's savings goal for the current month
    const goal = await Goal.findOne({ userId, month: now.getMonth(), year: now.getFullYear() });

    if (!goal) {
      return res.status(404).json({ message: 'No savings goal set for the current month' });
    }

    // Fetch the user's total expenses for the current month
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const currentSpending = totalExpenses.length > 0 ? totalExpenses[0].total : 0;
    const remainingToGoal = goal.goalAmount - currentSpending;
    const progressPercentage = (currentSpending / goal.goalAmount) * 100;

    res.status(200).json({
      goalAmount: goal.goalAmount,
      currentSpending: currentSpending,
      remainingToGoal: remainingToGoal,
      progressPercentage: isFinite(progressPercentage) ? progressPercentage : 0,
    });

  } catch (error) {
    console.error('Error fetching goal progress:', error);
    res.status(500).json({ message: 'Failed to fetch goal progress' });
  }
});

module.exports = router;