const express = require("express");
const { leaderboard, updateLeaderboard } = require("../controllers/Leaderboard");

const router = express.Router();

router.get("/", leaderboard);
router.get("/update", updateLeaderboard);

module.exports = router;