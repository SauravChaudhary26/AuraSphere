const express = require("express");
const authMiddleware = require("../middlewares/JwtValidation");
const {
  addGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
} = require("../controllers/GoalController");

const router = express.Router();

// Add a new goal
router.post("/", authMiddleware, addGoal);

// Get all goals for the authenticated user
router.get("/", authMiddleware, getAllGoals);

// Update a goal by ID
router.put("/:goalId", authMiddleware, updateGoal);

// Delete a goal by ID
router.delete("/:goalId", authMiddleware, deleteGoal);

module.exports = router;
