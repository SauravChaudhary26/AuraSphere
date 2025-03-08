// routes/timetableRoutes.js
const express = require("express");
const router = express.Router();
const timetableController = require("../controllers/timetableController");

// Create a new timetable (if needed)
router.post("/", timetableController.createTimetable);

// Fetch a user’s timetable
router.get("/:userId", timetableController.getTimetable);

// Update a user’s timetable
router.put("/:userId", timetableController.updateTimetable);

module.exports = router;
