const Assignment = require("../models/Assignment");

// Get all assignments for a given user
const getAssignments = async (req, res) => {
   const { userId } = req.params;
   try {
      const assignments = await Assignment.find({ userId });
      res.status(200).json(assignments);
   } catch (error) {
      res.status(500).json({ message: "Error fetching assignments" });
   }
};

// Add a new assignment
const addAssignment = async (req, res) => {
   const { userId, title, description, course, deadline } = req.body;
   if (!userId || !title || !course || !deadline) {
      return res.status(400).json({ message: "Missing required fields" });
   }
   try {
      await Assignment.create({
         userId,
         title,
         description,
         course,
         deadline,
         completed: false,
      });
      // Return updated assignments list for the user
      const assignments = await Assignment.find({ userId });
      res.status(201).json(assignments);
   } catch (error) {
      res.status(500).json({ message: "Error adding assignment" });
   }
};

// Toggle assignment completion status
const updateAssignment = async (req, res) => {
   const { id } = req.params;
   const { completed } = req.body;
   try {
      const updatedAssignment = await Assignment.findByIdAndUpdate(
         id,
         { completed },
         { new: true }
      );
      if (!updatedAssignment) {
         return res.status(404).json({ message: "Assignment not found" });
      }
      res.status(200).json(updatedAssignment);
   } catch (error) {
      res.status(500).json({ message: "Error updating assignment" });
   }
};

// Delete an assignment and return updated assignments list
const deleteAssignment = async (req, res) => {
   const { id } = req.params;
   const userId = req.query.userId; // Pass userId as a query parameter
   try {
      const data = await Assignment.findByIdAndDelete(id);
      if (userId) {
         const assignments = await Assignment.find({ userId });
         return res.status(200).json(assignments);
      }
      res.status(200).json(data);
   } catch (error) {
      res.status(500).json({ message: "Error deleting assignment" });
   }
};

module.exports = {
   getAssignments,
   addAssignment,
   updateAssignment,
   deleteAssignment,
};
