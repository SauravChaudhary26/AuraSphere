const Assignment = require("../models/Assignment");
const { awardPoints } = require("../services/pointsService");
const { config } = require("../config");

// All handlers scope strictly to req.userId (set by JwtValidation). The client
// can never address another user's assignments.

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ userId: req.userId }).sort({ deadline: 1 });
    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};

const addAssignment = async (req, res, next) => {
  try {
    const { title, description, course, deadline } = req.body;
    if (!title || !course || !deadline) {
      return res.status(400).json({ message: "Title, course and deadline are required" });
    }
    await Assignment.create({
      userId: req.userId,
      title,
      description,
      course,
      deadline,
      completed: false,
    });
    const assignments = await Assignment.find({ userId: req.userId }).sort({ deadline: 1 });
    res.status(201).json(assignments);
  } catch (err) {
    next(err);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completed, title, description, course, deadline } = req.body;

    const existing = await Assignment.findOne({ _id: id, userId: req.userId });
    if (!existing) return res.status(404).json({ message: "Assignment not found" });

    const wasCompleted = existing.completed;

    if (title !== undefined) existing.title = title;
    if (description !== undefined) existing.description = description;
    if (course !== undefined) existing.course = course;
    if (deadline !== undefined) existing.deadline = deadline;
    if (completed !== undefined) existing.completed = completed;
    await existing.save();

    // Award aura the first time an assignment is completed.
    let award = null;
    if (!wasCompleted && existing.completed) {
      award = await awardPoints(req.userId, config.points.assignmentCompleted, "assignment_completed", {
        model: "Assignment",
        id: existing._id,
      });
    }

    const body = existing.toObject();
    if (award) {
      body.awarded = award.amount;
      body.boosted = award.boosted;
    }
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Assignment.findOneAndDelete({ _id: id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Assignment not found" });
    const assignments = await Assignment.find({ userId: req.userId }).sort({ deadline: 1 });
    res.status(200).json(assignments);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssignments, addAssignment, updateAssignment, deleteAssignment };
