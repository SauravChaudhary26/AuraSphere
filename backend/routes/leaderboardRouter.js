const express = require("express");
const { leaderboard, updateLeaderboard } = require("../controllers/Leaderboard");

const router = express.Router();

router.get("/", leaderboard);

module.exports = router;