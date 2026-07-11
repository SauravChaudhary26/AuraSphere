const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");
const { getAllIssues, getIssue } = require("../controllers/issueController");

// Admin-only. (Public issue reporting lives in routes/publicRouter.js.)
// Mounted under the JWT-protected main router, so requireAdmin runs after auth.
router.get("/", requireAdmin, getAllIssues);
router.get("/:id", requireAdmin, getIssue);

module.exports = router;
