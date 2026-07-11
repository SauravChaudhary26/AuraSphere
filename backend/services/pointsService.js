const mongoose = require("mongoose");
const User = require("../models/User");
const AuraTransaction = require("../models/AuraTransaction");

/**
 * Award aura. Server-authoritative: the amount is chosen by the server (from
 * config.points), never accepted from the client. Records a ledger entry.
 */
async function awardPoints(userId, amount, reason, ref = {}) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Award amount must be a positive number");
  }
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { aura: amount } },
    { new: true }
  ).select("aura");
  if (!user) throw new Error("User not found");

  await AuraTransaction.create({
    userId,
    amount,
    reason,
    refModel: ref.model || null,
    refId: ref.id || null,
    balanceAfter: user.aura,
  });
  return user.aura;
}

/**
 * Spend aura. Atomic conditional decrement prevents races and negative
 * balances (the update only matches when the user has enough).
 */
async function spendPoints(userId, amount, reason, ref = {}) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new Error("Spend amount must be a positive number");
  }
  const user = await User.findOneAndUpdate(
    { _id: userId, aura: { $gte: amount } },
    { $inc: { aura: -amount } },
    { new: true }
  ).select("aura");

  if (!user) {
    const exists = await User.exists({ _id: userId });
    const err = new Error(exists ? "Not enough aura" : "User not found");
    err.status = exists ? 400 : 404;
    throw err;
  }

  await AuraTransaction.create({
    userId,
    amount: -amount,
    reason,
    refModel: ref.model || null,
    refId: ref.id || null,
    balanceAfter: user.aura,
  });
  return user.aura;
}

async function getBalance(userId) {
  const u = await User.findById(userId).select("aura");
  return u ? u.aura : 0;
}

/** Sum of aura EARNED (positive entries only) since a given date. */
async function earnedSince(userId, since) {
  const rows = await AuraTransaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(String(userId)),
        amount: { $gt: 0 },
        createdAt: { $gte: since },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return rows[0]?.total || 0;
}

module.exports = { awardPoints, spendPoints, getBalance, earnedSince };
