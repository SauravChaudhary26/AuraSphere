const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');

// Get attendance for a specific course
router.get('/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId; 

    const attendance = await Attendance.find({
      studentId,
      courseId
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const { courseId, date, status } = req.body;
    const studentId = req.userId;

    // Validate input
    if (!courseId || !date || !status) {
      return res.status(400).json({ message: 'Course ID, date, and status are required' });
    }

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'Status must be either "present" or "absent"' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      studentId,
      courseId,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      await existingAttendance.save();
      res.json(existingAttendance);
    } else {
      // Create new attendance record
      const attendance = new Attendance({
        studentId,
        courseId,
        date: new Date(date),
        status
      });

      await attendance.save();
      res.status(201).json(attendance);
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attendance statistics for a course
router.get('/:courseId/stats', async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.userId;

    const totalRecords = await Attendance.countDocuments({
      studentId,
      courseId
    });

    const presentRecords = await Attendance.countDocuments({
      studentId,
      courseId,
      status: 'present'
    });

    const percentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    res.json({
      total: totalRecords,
      present: presentRecords,
      absent: totalRecords - presentRecords,
      percentage
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete attendance record
router.delete('/:attendanceId', async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const studentId = req.userId;

    const attendance = await Attendance.findOne({
      _id: attendanceId,
      studentId
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await Attendance.findByIdAndDelete(attendanceId);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;