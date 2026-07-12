const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemKey: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    // Per-purchase outcome data (e.g. Mystery Box prize: { won: 150 }).
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redemption", redemptionSchema);
