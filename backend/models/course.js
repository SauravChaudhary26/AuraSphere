const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  schedule: [{
    day: { type: String, required: true },
    time: { type: String, required: true }, // e.g., "10:00 AM - 12:00 PM"
  }],
  instructor: {
    type: String,
    required: true,
  },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
