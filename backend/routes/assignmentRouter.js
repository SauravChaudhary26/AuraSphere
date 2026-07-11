const express = require("express");
const {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

const router = express.Router();

// The authenticated user is always the owner (req.userId) — no userId in the path.
router.get("/", getAssignments);
router.post("/", addAssignment);
router.patch("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

module.exports = router;
