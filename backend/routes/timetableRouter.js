const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const Course = require('../models/course');

// GET /timetable - Get user's timetable
router.get('/', async (req, res) => {
  try {
    let timetable = await Timetable.findOne({ userId: req.userId });

    if (!timetable) {
      // Create empty timetable if none exists
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const timeSlots = [
        '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
        '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
      ];

      const emptySchedule = new Map();
      days.forEach(day => {
        const daySlots = new Map();
        timeSlots.forEach(slot => {
          daySlots.set(slot, null);
        });
        emptySchedule.set(day, daySlots);
      });

      timetable = new Timetable({
        userId: req.userId,
        schedule: emptySchedule
      });

      await timetable.save();
    }

    // Convert Maps to objects for JSON response
    const scheduleObj = {};
    for (const [day, timeSlots] of timetable.schedule) {
      scheduleObj[day] = {};
      for (const [slot, courseId] of timeSlots) {
        scheduleObj[day][slot] = courseId;
      }
    }

    res.json({ schedule: scheduleObj });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Error fetching timetable', error: error.message });
  }
});

// POST /timetable - Save/Update user's timetable
router.post('/', async (req, res) => {
  try {
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({ message: 'Schedule data is required' });
    }

    // Convert schedule object to Map format
    const scheduleMap = new Map();
    for (const day in schedule) {
      const dayMap = new Map();
      for (const slot in schedule[day]) {
        dayMap.set(slot, schedule[day][slot]);
      }
      scheduleMap.set(day, dayMap);
    }

    let timetable = await Timetable.findOne({ userId: req.userId });

    if (timetable) {
      timetable.schedule = scheduleMap;
      await timetable.save();
    } else {
      timetable = new Timetable({
        userId: req.userId,
        schedule: scheduleMap
      });
      await timetable.save();
    }

    res.json({ message: 'Timetable saved successfully', timetable });
  } catch (error) {
    console.error('Error saving timetable:', error);
    res.status(500).json({ message: 'Error saving timetable', error: error.message });
  }
});

// DELETE /timetable - Clear user's timetable
router.delete('/', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
      '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
    ];

    const emptySchedule = new Map();
    days.forEach(day => {
      const daySlots = new Map();
      timeSlots.forEach(slot => {
        daySlots.set(slot, null);
      });
      emptySchedule.set(day, daySlots);
    });

    await Timetable.findOneAndUpdate(
      { userId: req.userId },
      { schedule: emptySchedule },
      { upsert: true }
    );

    res.json({ message: 'Timetable cleared successfully' });
  } catch (error) {
    console.error('Error clearing timetable:', error);
    res.status(500).json({ message: 'Error clearing timetable', error: error.message });
  }
});

// GET /timetable/export - Export timetable with course details
router.get('/export', async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ userId: req.userId });

    if (!timetable) {
      return res.status(404).json({ message: 'No timetable found' });
    }

    // Get all course IDs from the schedule
    const courseIds = [];
    for (const [day, timeSlots] of timetable.schedule) {
      for (const [slot, courseId] of timeSlots) {
        if (courseId) {
          courseIds.push(courseId);
        }
      }
    }

    // Fetch course details
    const courses = await Course.find({
      _id: { $in: courseIds },
      userId: req.userId
    });

    const courseMap = {};
    courses.forEach(course => {
      courseMap[course._id.toString()] = {
        name: course.name,
        _id: course._id
      };
    });

    // Build detailed schedule
    const detailedSchedule = {};
    for (const [day, timeSlots] of timetable.schedule) {
      detailedSchedule[day] = {};
      for (const [slot, courseId] of timeSlots) {
        if (courseId && courseMap[courseId.toString()]) {
          detailedSchedule[day][slot] = courseMap[courseId.toString()];
        } else {
          detailedSchedule[day][slot] = null;
        }
      }
    }

    res.json({
      exportDate: new Date(),
      schedule: detailedSchedule
    });
  } catch (error) {
    console.error('Error exporting timetable:', error);
    res.status(500).json({ message: 'Error exporting timetable', error: error.message });
  }
});

module.exports = router;