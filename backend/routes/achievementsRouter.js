const express = require("express");
const router = express.Router();
const { getAchievements } = require("../services/achievements");

router.get("/", async (req, res, next) => {
  try {
    const data = await getAchievements(req.userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
