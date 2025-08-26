const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
	enum: [	'Bug Report',
    		'Feature Request',
    		'UI/UX Issue',
    		'Performance Issue',
    		'Security Concern',
    		'Data Issue',
    		'Login/Authentication',
    		'Other'
	],
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  steps: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  expectedBehavior: {
    type: String,
    trim: true,
    maxlength: 500
  },
  actualBehavior: {
    type: String,
    trim: true,
    maxlength: 500
  },
  browserInfo: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
issueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Issue', issueSchema);