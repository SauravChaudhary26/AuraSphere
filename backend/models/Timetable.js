const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    required: true
  },
  timeSlot: {
    type: String,
    required: true // Format: "09:00-10:00"
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one course per time slot per user
timetableSchema.index({ userId: 1, day: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
