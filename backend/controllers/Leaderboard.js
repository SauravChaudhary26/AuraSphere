const { getLeaderboard, rebuildLeaderboard } = require("../services/leaderboardService");
const { config } = require("../config");

// Public (authenticated) leaderboard read: top-N plus the viewer's own rank.
const leaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const period = ["all", "week", "day"].includes(req.query.period) ? req.query.period : "all";
    const data = await getLeaderboard(req.userId, { limit, period });
    res.status(200).json({
      success: true,
      message: "Leaderboard fetched",
      period,
      userData: data.top, // legacy key kept for the existing frontend
      top: data.top,
      me: data.me,
      updatedAt: data.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// Cron-triggered rebuild. Secret-gated; refuses if no secret is configured.
const updateLeaderboard = async (req, res, next) => {
  try {
    if (!config.cronSecret) {
      return res.status(503).json({ success: false, message: "Cron not configured" });
    }
    if (req.headers["x-cron-secret"] !== config.cronSecret) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await rebuildLeaderboard();
    res.json({ success: true, message: "Leaderboard rebuilt" });
  } catch (err) {
    next(err);
  }
};

module.exports = { leaderboard, updateLeaderboard, rebuildLeaderboard };
