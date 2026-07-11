const mongoose = require("mongoose");

/**
 * Append-only ledger of every aura change. The source of truth for daily/weekly
 * leaderboards and the user's activity history; User.aura is the running total.
 */
const auraTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true }, // positive = earned, negative = spent
    reason: { type: String, required: true },
    refModel: { type: String, default: null },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    balanceAfter: { type: Number },
  },
  { timestamps: true }
);

auraTransactionSchema.index({ userId: 1, createdAt: -1 });
auraTransactionSchema.index({ amount: 1, createdAt: -1 });

module.exports = mongoose.model("AuraTransaction", auraTransactionSchema);
