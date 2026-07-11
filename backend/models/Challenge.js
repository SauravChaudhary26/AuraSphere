const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
   {
      sender: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      receiver: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      message: { type: String, required: true, trim: true, maxlength: 500 },
      deadline: { type: Date, required: true },
      rated: { type: Boolean, default: false },
      // Guards against awarding points more than once for the same challenge.
      pointsAwarded: { type: Boolean, default: false },
      status: {
         type: String,
         enum: ["pending", "accepted", "completed", "rejected"],
         default: "pending",
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
