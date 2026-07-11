const express = require("express");
const rateLimit = require("express-rate-limit");
const { submitContact } = require("../controllers/contactController");
const { createIssue } = require("../controllers/issueController");

const router = express.Router();

// Stricter limit for anonymous write endpoints (spam protection).
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ success: false, message: "Too many submissions, try again later" }),
});

// Public, unauthenticated submissions.
router.post("/contact", submitLimiter, submitContact);
router.post("/issues", submitLimiter, createIssue);

module.exports = router;
