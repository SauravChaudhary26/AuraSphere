const express = require("express");
const { updateLeaderboard } = require("../controllers/Leaderboard");

const router = express.Router();

router.get("/leaderboard", updateLeaderboard);

module.exports = router;