const User = require("../models/User");
const AuraTransaction = require("../models/AuraTransaction");

/**
 * Leaderboards.
 * - "all": all-time ranking by User.aura (cached snapshot, rebuilt periodically,
 *   with a live rank lookup for viewers outside the top-N).
 * - "week"/"day": aura EARNED in the window, aggregated from the ledger.
 * Every response includes the viewer's own rank.
 */
let cache = { top: [], updatedAt: 0 };

async function rebuildLeaderboard() {
  const users = await User.find().select("name aura avatar equipped").sort({ aura: -1, _id: 1 }).limit(100).lean();
  cache = {
    top: users.map((u, i) => ({ rank: i + 1, id: u._id, name: u.name, aura: u.aura || 0, avatar: u.avatar || null, equipped: u.equipped || null })),
    updatedAt: Date.now(),
  };
  return cache;
}

async function allTime(userId, limit) {
  // Refresh when never built, empty, or older than 60s so newly-earned aura and
  // newly-registered users show up without waiting for the 5-min scheduler.
  if (!cache.updatedAt || cache.top.length === 0 || Date.now() - cache.updatedAt > 60000) {
    await rebuildLeaderboard();
  }
  const top = cache.top.slice(0, limit);
  let me = cache.top.find((e) => String(e.id) === String(userId)) || null;
  if (!me && userId) {
    const u = await User.findById(userId).select("name aura avatar equipped").lean();
    if (u) {
      const higher = await User.countDocuments({ aura: { $gt: u.aura || 0 } });
      me = { rank: higher + 1, id: u._id, name: u.name, aura: u.aura || 0, avatar: u.avatar || null, equipped: u.equipped || null };
    }
  }
  return { top, me, updatedAt: cache.updatedAt };
}

async function windowed(userId, since, limit) {
  const rows = await AuraTransaction.aggregate([
    { $match: { amount: { $gt: 0 }, createdAt: { $gte: since } } },
    { $group: { _id: "$userId", aura: { $sum: "$amount" } } },
    { $sort: { aura: -1 } },
    { $limit: 200 },
    { $lookup: { from: "userdatas", localField: "_id", foreignField: "_id", as: "u" } },
    { $unwind: "$u" },
    { $project: { aura: 1, name: "$u.name", avatar: "$u.avatar", equipped: "$u.equipped" } },
  ]);
  const ranked = rows.map((r, i) => ({ rank: i + 1, id: r._id, name: r.name, aura: r.aura, avatar: r.avatar || null, equipped: r.equipped || null }));
  const me = ranked.find((e) => String(e.id) === String(userId)) || { rank: null, id: userId, aura: 0, name: "You", avatar: null };
  return { top: ranked.slice(0, limit), me, updatedAt: Date.now() };
}

async function getLeaderboard(userId, { limit = 10, period = "all" } = {}) {
  if (period === "day") {
    const d = new Date();
    return windowed(userId, new Date(d.getFullYear(), d.getMonth(), d.getDate()), limit);
  }
  if (period === "week") {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    start.setDate(start.getDate() - start.getDay());
    return windowed(userId, start, limit);
  }
  return allTime(userId, limit);
}

module.exports = { rebuildLeaderboard, getLeaderboard };
