const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      title: { type: String, required: true, trim: true, maxlength: 200 },
      description: { type: String, required: true, trim: true, maxlength: 2000 },
      targetDate: { type: Date, required: true },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
      isPinned: { type: Boolean, default: false },
   },
   { timestamps: true }
);

// Common access pattern: a user's active/completed goals, pinned first.
goalSchema.index({ userId: 1, completed: 1, isPinned: -1 });

module.exports = mongoose.model("Goal", goalSchema);
