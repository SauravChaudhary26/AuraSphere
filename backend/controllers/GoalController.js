const Goal = require("../models/Goal");

const addGoal = async (req, res) => {
   const { title, description, targetDate } = req.body;

   if (!req.userId) {
      return res
         .status(401)
         .json({ message: "Unauthorized: User ID not found" });
   }

   if (!title || !description || !targetDate) {
      return res.status(400).json({ message: "All fields are required" });
   }

   try {
      const goal = new Goal({
         userId: req.userId,
         title,
         description,
         targetDate,
      });

      await goal.save();
      res.status(201).json({ message: "Goal added successfully", goal });
   } catch (error) {
      console.error("Error adding goal:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

const getAllGoals = async (req, res) => {
   try {
      const goals = await Goal.find({
         userId: req.userId,
         completed: false,
      }).sort({ isPinned: -1 });
      res.status(200).json(goals); // Return empty array if no goals
   } catch (error) {
      console.error("Error fetching goals:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

const updateGoal = async (req, res) => {
   const { goalId } = req.params;
   const { title, description, targetDate, completed } = req.body;

   try {
      const updatedGoal = await Goal.findOneAndUpdate(
         { _id: goalId, userId: req.userId },
         { title, description, targetDate, completed },
         { new: true }
      );

      if (!updatedGoal) {
         return res.status(404).json({ message: "Goal not found" });
      }

      res.status(200).json(updatedGoal);
   } catch (error) {
      console.error("Error updating goal:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

const deleteGoal = async (req, res) => {
   const { goalId } = req.params;

   try {
      const goal = await Goal.findOneAndDelete({
         _id: goalId,
         userId: req.userId,
      });

      if (!goal) {
         return res.status(404).json({ message: "Goal not found" });
      }

      res.status(200).json({ message: "Goal deleted successfully" });
   } catch (error) {
      console.error("Error deleting goal:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

const pinGoal = async (req, res) => {
   try {
      const { goalId } = req.body;

      // Find the goal to check its current state
      const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
      if (!goal) {
         return res.status(404).json({ message: "Goal not found" });
      }

      // Toggle the isPinned value
      goal.isPinned = !goal.isPinned;
      await goal.save();

      res.status(200).json({ message: "Goal updated succesfully" });
   } catch (e) {
      console.log("error while updating goal ", e);
      res.status(500).json({ message: "Internal Server error" });
   }
};

module.exports = {
   addGoal,
   getAllGoals,
   updateGoal,
   deleteGoal,
   pinGoal,
};
