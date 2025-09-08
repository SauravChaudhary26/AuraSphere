const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schedule: {
    type: Map,
    of: {
      type: Map,
      of: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
      }
    },
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);