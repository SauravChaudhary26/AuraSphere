const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
   {
      sender: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "userdata",
         required: true,
      },
      receiver: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "userdata",
         required: true,
      },
      message: { type: String, required: true },
      deadline: { type: Date, required: true },
      rated: { type: Boolean, default: false },
      status: {
         type: String,
         enum: ["pending", "accepted", "completed", "rejected"],
         default: "pending",
      },
   },
   { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
