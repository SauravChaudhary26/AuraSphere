const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, enum: ["exam", "event", "deadline"], default: "event" },
    date: { type: Date, required: true },
    color: { type: String, default: "#7c5cff" },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

eventSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Event", eventSchema);
