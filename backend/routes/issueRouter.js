const express = require('express');
const router = express.Router();
const { createIssue, getAllIssues, getIssue } = require('../controllers/issueController');

// POST /api/issues - Create a new issue report
router.post('/', createIssue);

// GET /api/issues - Get all issues (for admin)
router.get('/', getAllIssues);

// GET /api/issues/:id - Get a specific issue
router.get('/:id', getIssue);

module.exports = router;