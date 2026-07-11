const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemKey: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redemption", redemptionSchema);
