const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const authMiddleware = require('../middleware/authMiddleware');

// Route to set a monthly savings goal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { goalAmount, month, year } = req.body;
    const userId = req.userId;

    // Check if a goal already exists for this user and month/year
    const existingGoal = await Goal.findOne({ userId, month, year });

    if (existingGoal) {
      return res.status(400).json({ message: 'Savings goal already set for this month' });
    }

    const newGoal = new Goal({
      userId,
      goalAmount,
      month,
      year,
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error('Error setting savings goal:', error);
    res.status(500).json({ message: 'Failed to set savings goal' });
  }
});

// Route to get the savings goal for the current month (or a specific month/year)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const month = parseInt(req.query.month) || new Date().getMonth();
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const goal = await Goal.findOne({ userId, month, year });

    if (goal) {
      res.status(200).json(goal);
    } else {
      res.status(404).json({ message: 'No savings goal set for this month' });
    }
  } catch (error) {
    console.error('Error fetching savings goal:', error);
    res.status(500).json({ message: 'Failed to fetch savings goal' });
  }
});

// Route to update an existing savings goal for the current month (or a specific month/year)
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { goalAmount, month, year } = req.body;
    const userId = req.userId;

    const goal = await Goal.findOneAndUpdate(
      { userId, month, year },
      { goalAmount, updatedAt: Date.now() },
      { new: true }
    );

    if (goal) {
      res.status(200).json(goal);
    } else {
      res.status(404).json({ message: 'No savings goal found for this month to update' });
    }
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ message: 'Failed to update savings goal' });
  }
});

module.exports = router;