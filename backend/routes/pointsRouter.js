const express = require("express");
const router = express.Router();
const {
  getPoints,
  getPointsSummary,
  getPointsHistory,
} = require("../controllers/pointsController");

// NOTE: there is intentionally no endpoint to set/add points directly.
// Aura is server-authoritative and only changes through defined actions
// (completing goals/assignments/challenges, store purchases, etc.).
router.get("/", getPoints);
router.get("/summary", getPointsSummary);
router.get("/history", getPointsHistory);

module.exports = router;
