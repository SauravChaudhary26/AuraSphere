const express = require('express');
const Goal = require('../models/Goal');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Add a new goal
router.post('/', authMiddleware, async (req, res) => {
  const { description, targetDate } = req.body;

  try {
    const goal = new Goal({
      userId: req.userId, // Retrieved from the auth middleware
      description,
      targetDate,
    });

    await goal.save();
    res.status(201).json({ message: 'Goal added successfully', goal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all goals for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a goal by ID
router.put('/:goalId', authMiddleware, async (req, res) => {
  const { goalId } = req.params;
  const { description, targetDate, completed } = req.body;

  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId: req.userId },
      { description, targetDate, completed },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({ message: 'Goal updated successfully', goal });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a goal by ID
router.delete('/:goalId', authMiddleware, async (req, res) => {
  const { goalId } = req.params;

  try {
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId: req.userId });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    res.status(200).json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
