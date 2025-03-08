// controllers/timetableController.js
const Timetable = require("../models/Timetable");

// Create a new timetable for a user (e.g. during registration)
exports.createTimetable = async (req, res) => {
   try {
      // console.log("createTimetable was called");
      const { userId } = req.body;
      const existingTimetable = await Timetable.findOne({ user: userId });
      if (existingTimetable) {
         return res
            .status(400)
            .json({ error: "Timetable already exists for this user" });
      }

      // Create a timetable with 50 "Break" subjects
      const timetable = Array.from({ length: 50 }, () => ({
         subject: "Break",
      }));
      const newTimetable = new Timetable({ user: userId, timetable });
      await newTimetable.save();
      res.status(201).json(newTimetable);
   } catch (error) {
      console.error("Error creating timetable:", error);
      res.status(500).json({ error: error.message });
   }
};

// Get timetable for a user
exports.getTimetable = async (req, res) => {
   try {
      const { userId } = req.params;
      // console.log("getTimetable was called", userId);

      const timetable = await Timetable.findOne({ user: userId });
      if (!timetable)
         return res.status(404).json({ error: "Timetable not found" });
      res.json(timetable);
   } catch (error) {
      console.error("Error fetching timetable:", error);
      res.status(500).json({ error: error.message });
   }
};

// Update timetable for a user
exports.updateTimetable = async (req, res) => {
   try {
      // console.log("updateTimetable was called");
      const { userId } = req.params;
      const { timetable } = req.body;
      if (!Array.isArray(timetable) || timetable.length !== 50) {
         return res
            .status(400)
            .json({ error: "Timetable must be an array of 50 elements" });
      }
      const updatedTimetable = await Timetable.findOneAndUpdate(
         { user: userId },
         { timetable },
         { new: true }
      );
      if (!updatedTimetable)
         return res.status(404).json({ error: "Timetable not found" });
      res.json(updatedTimetable);
   } catch (error) {
      console.error("Error updating timetable:", error);
      res.status(500).json({ error: error.message });
   }
};
