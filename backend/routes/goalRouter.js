const express = require("express");
const {
  addGoal,
  getAllGoals,
  updateGoal,
  deleteGoal,
  pinGoal,
  completeGoal,
} = require("../controllers/GoalController");

const router = express.Router();

router.get("/", getAllGoals);
router.post("/", addGoal);
router.patch("/pin", pinGoal);
router.patch("/:goalId/complete", completeGoal); // was a state-mutating GET
router.put("/:goalId", updateGoal);
router.delete("/:goalId", deleteGoal);

module.exports = router;
