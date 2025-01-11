const Goal = require("../models/Goal");

const addGoal = async (req, res) => {
   const { title, description, targetDate } = req.body;

   console.log(req.body);

   try {
      const goal = new Goal({
         userId: req.userId, // Retrieved from the auth middleware
         title,
         description,
         targetDate,
      });

      await goal.save();
      res.status(201).json({ message: "Goal added successfully", goal });
   } catch (error) {
      res.status(500).json({ message: "Server error" });
   }
};

const getAllGoals = async (req, res) => {
   try {
      const goals = await Goal.find({ userId: req.userId, completed: false });

      if (!goals.length) {
         return res.status(404).json({ message: "No goals found" });
      }

      res.status(200).json(goals);
   } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
   }
};

const updateGoal = async (req, res) => {
   const { goalId } = req.params;
   const { description, targetDate, completed } = req.body;

   try {
      const goal = await Goal.findOneAndUpdate(
         { _id: goalId, userId: req.userId },
         { description, targetDate, completed }
      );

      if (!goal) {
         return res.status(404).json({ message: "Goal not found" });
      }

      res.status(200).json({ message: "Goal updated successfully", goal });
   } catch (error) {
      res.status(500).json({ message: "Server error" });
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
      res.status(500).json({ message: "Server error" });
   }
};

module.exports = {
   addGoal,
   getAllGoals,
   updateGoal,
   deleteGoal,
};
