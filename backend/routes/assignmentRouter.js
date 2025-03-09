const express = require("express");
const {
   getAssignments,
   addAssignment,
   updateAssignment,
   deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// Get assignments for a user
router.get("/:userId", getAssignments);
// Create a new assignment
router.post("/", addAssignment);
// Toggle assignment completion
router.patch("/:id", updateAssignment);
// Delete an assignment (expects userId as a query param, e.g. /api/assignments/:id?userId=...)
router.delete("/:id", deleteAssignment);

module.exports = router;
