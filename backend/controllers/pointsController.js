const { getBalance, earnedSince } = require("../services/pointsService");
const AuraTransaction = require("../models/AuraTransaction");

// Current aura balance.
const getPoints = async (req, res, next) => {
  try {
    const points = await getBalance(req.userId);
    res.status(200).json({ points });
  } catch (err) {
    next(err);
  }
};

// Balance plus today / this-week earnings for dashboards.
const getPointsSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

    const [total, today, week] = await Promise.all([
      getBalance(req.userId),
      earnedSince(req.userId, startOfDay),
      earnedSince(req.userId, startOfWeek),
    ]);

    res.status(200).json({ total, today, week });
  } catch (err) {
    next(err);
  }
};

// Recent aura ledger entries (earn + spend).
const getPointsHistory = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const history = await AuraTransaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.status(200).json({ history });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPoints, getPointsSummary, getPointsHistory };
