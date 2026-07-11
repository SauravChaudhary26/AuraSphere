const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
   {
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      name: { type: String, required: true, trim: true, maxlength: 120 },
      // Hex color for color-coded timetable / attendance UI.
      color: { type: String, default: "#7c5cff" },
   },
   { timestamps: true }
);

// One course name per user (also enforces the duplicate check in the controller).
courseSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Course", courseSchema);
