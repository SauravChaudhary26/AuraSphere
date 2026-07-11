const Goal = require("../models/Goal");
const { awardPoints } = require("../services/pointsService");
const { config } = require("../config");

const addGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate } = req.body;
    if (!title || !description || !targetDate) {
      return res.status(400).json({ message: "Title, description and target date are required" });
    }
    const goal = await Goal.create({ userId: req.userId, title, description, targetDate });
    res.status(201).json({ message: "Goal added successfully", goal });
  } catch (err) {
    next(err);
  }
};

const getAllGoals = async (req, res, next) => {
  try {
    const filter = { userId: req.userId };
    // ?status=completed | active | all  (default: active)
    const status = req.query.status || "active";
    if (status === "active") filter.completed = false;
    else if (status === "completed") filter.completed = true;

    const goals = await Goal.find(filter).sort({ isPinned: -1, targetDate: 1 });
    res.status(200).json(goals);
  } catch (err) {
    next(err);
  }
};

const updateGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { title, description, targetDate } = req.body;
    const updated = await Goal.findOneAndUpdate(
      { _id: goalId, userId: req.userId },
      { title, description, targetDate },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

const deleteGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const pinGoal = async (req, res, next) => {
  try {
    const { goalId } = req.body;
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    goal.isPinned = !goal.isPinned;
    await goal.save();
    res.status(200).json({ message: "Goal updated successfully", isPinned: goal.isPinned });
  } catch (err) {
    next(err);
  }
};

// Marks a goal complete (kept for history) and awards aura once. Idempotent:
// completing an already-complete goal does not award points again.
const completeGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    if (goal.completed) {
      return res.status(200).json({ message: "Goal already completed", goal });
    }

    goal.completed = true;
    goal.completedAt = new Date();
    await goal.save();

    const aura = await awardPoints(req.userId, config.points.goalCompleted, "goal_completed", {
      model: "Goal",
      id: goal._id,
    });

    res.status(200).json({
      message: "Goal completed successfully",
      goal,
      awarded: config.points.goalCompleted,
      aura,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { addGoal, getAllGoals, updateGoal, deleteGoal, pinGoal, completeGoal };
