const express = require("express");
const {
   addGoal,
   getAllGoals,
   updateGoal,
   deleteGoal,
   pinGoal,
   completeGoal
} = require("../controllers/GoalController");

const router = express.Router();

// Add a new goal
router.post("/", addGoal);

// Get all goals for the authenticated user
router.get("/", getAllGoals);

//Completing a goal
router.get("/complete/:goalId", completeGoal);

// Update a goal by ID
router.put("/:goalId", updateGoal);

// Delete a goal by ID
router.delete("/:goalId", deleteGoal);

router.patch("/pin", pinGoal);

module.exports = router;
